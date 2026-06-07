import re
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from src.embeddings import get_embeddings
from src.llm_setup import get_llm
from src.sources import get_source_url

load_dotenv()

DB_DIR = str(Path(__file__).resolve().parent.parent / "vector_db")

# load reusable parts
_vector_db = None
_llm = None

def _db():
    global _vector_db
    if _vector_db is not None:
        return _vector_db
    emb = get_embeddings()
    try:
        db = Chroma(persist_directory=DB_DIR, embedding_function=emb)
        if db._collection.count() > 0:
            _vector_db = db
            return _vector_db
    except Exception:
        pass
    import shutil
    from src.loader import load_knowledge_base
    from src.chunker import chunk_documents
    shutil.rmtree(DB_DIR, ignore_errors=True)
    chunks = chunk_documents(load_knowledge_base())
    _vector_db = Chroma.from_documents(documents=chunks, embedding=emb, persist_directory=DB_DIR)
    return _vector_db

def _model():
    global _llm
    if _llm is None:
        _llm = get_llm()
    return _llm

_STOP = {"horario", "horarios", "curso", "cursos", "aulas", "aula", "exame", "exames",
         "ano", "anos", "semestre", "escola", "estudante", "qual", "onde", "quando",
         "sobre", "para", "como", "schedule", "class", "lecture", "exam", "year", "ipb"}

def _terms(text):
    t = text.lower()
    for a, b in (("á", "a"), ("é", "e"), ("í", "i"), ("ó", "o"), ("ú", "u"),
                 ("â", "a"), ("ê", "e"), ("ô", "o"), ("ã", "a"), ("õ", "o"), ("ç", "c")):
        t = t.replace(a, b)
    return {w for w in re.findall(r"[a-z]{4,}", t) if w not in _STOP}

def _search_docs(search_query, user_query):
    found = _db().similarity_search(search_query, k=10) + _db().similarity_search(user_query, k=4)
    docs, seen = [], set()
    for doc in found:
        if doc.page_content not in seen:
            seen.add(doc.page_content)
            docs.append(doc)
    qterms = _terms(search_query)
    if qterms:
        docs.sort(key=lambda d: len(qterms & _terms(d.page_content.split("\n", 1)[0])), reverse=True)
    return docs[:6]


def route_message(user_query, history):
    # decide what to do
    recent = ""
    if history:
        for turn in history[-6:]:
            recent += f"{turn['role']}: {turn['content']}\n"

    prompt = f"""You are IPBot, an assistant for the Polytechnic Institute of Bragança (IPB). You only help with IPB and university or student life (courses, dates, exams, regulations, tuition, scholarships, social services, the schools, enrolment, Erasmus and similar).

Earlier conversation (for context only):
{recent}
The student's latest message is:
"{user_query}"

Do ONE of these. Whenever you write a reply, write it in the SAME LANGUAGE as the student's latest message above (English message -> English reply, Portuguese message -> Portuguese reply):
- If the latest message is ONLY a greeting, thanks, or a short acknowledgement with no question in it (for example "hi", "hello", "yes", "ok", "sure", "yep", "thanks"): reply in one or two short, friendly sentences that invite a specific IPB question (you may suggest example topics like courses, schedules, tuition, scholarships, the canteen). Do NOT reintroduce yourself or repeat a full greeting if the conversation has already started; keep it natural and brief. Begin with "REPLY:".
- If it is NOT about IPB or university/student life (for example maths, programming, general trivia, personal advice or anything inappropriate): politely say you can only help with IPB questions. Begin with "REPLY:".
- If it asks a real question or makes a request about IPB or student life (even when it also starts with a greeting, like "hi, where is the canteen?"): rewrite it as one clear search query in the same language, fixing spelling and resolving any references from the conversation. Expand IPB programme codes to the full name, for example EI/LEI = Engenharia Informática, CD = Ciência de Dados, EEC = Engenharia Eletrotécnica e de Computadores, EGI = Engenharia e Gestão Industrial, EM = Engenharia Mecânica, EC = Engenharia Civil, EQ = Engenharia Química, EER/ER = Engenharia de Energias Renováveis, TB = Tecnologia Biomédica, TDG = Tecnologias Digitais e Gestão, GNI = Gestão de Negócios Internacionais (ESTiG, ESA, ESE, ESSa and EsACT are the five schools). Begin with "SEARCH:"."""

    try:
        return _model().invoke(prompt).content.strip()
    except Exception:
        return "SEARCH: " + user_query

def get_ipbot_response(user_query, history=None, doc_text=""):
    routed = "SEARCH: " + user_query if doc_text else route_message(user_query, history)

    # greeting or an off-topic message is answered directly without any documents
    if "SEARCH:" not in routed:
        return {"answer": routed.replace("REPLY:", "").strip(), "sources": []}
    search_query = routed.split("SEARCH:", 1)[1].strip()

    # find the most relevant documents
    docs = _search_docs(search_query, user_query)

    # build the context and remember which files it came from
    blocks = []
    sources = []
    cats = {}
    for doc in docs:
        name = Path(doc.metadata.get("source", "unknown")).name
        cats[name] = doc.metadata.get("category", "")
        blocks.append(doc.page_content)
        if name not in sources:
            sources.append(name)
    context_text = "\n\n---\n\n".join(blocks)
    if doc_text:
        context_text = "DOCUMENT UPLOADED BY THE STUDENT (read it and use it to answer):\n" + doc_text.strip() + "\n\n---\n\n" + context_text

    now = datetime.now(ZoneInfo("Europe/Lisbon")).strftime("%A, %d %B %Y, %H:%M")
    system = f"""You are IPBot, the official assistant for the Polytechnic Institute of Bragança (IPB).
The current date and time in Bragança (Portugal / Lisbon time) is {now}. Use it for questions about dates, schedules, deadlines, or what comes next.
IPB has five schools — ESTiG (technology and management), ESA (agriculture), ESE (education), ESSa (health) and EsACT (Mirandela). Help with all of them, not only ESTiG.
Answer the student using only the official documents below.
- Reply in the same language as the student's question, even if the documents are in another language.
- Format for easy reading: short sentences, **bold** for the key facts (dates, amounts, names), and bullet points for lists. Use a few fitting emojis (📅 dates, ⏰ times, 📧 email, 📞 phone, 🏫 school, 📚 course, 💶 tuition, 🍔 canteen) — tasteful, not on every line.
- For contacts, give the email 📧 and the phone number 📞 when they appear in the documents.
- For questions about where a place is, how it looks, or the canteen menu, include the map link, photo link or website that appears in the documents so the student can open it. Never invent or generate images.
- Programme codes mean the same as the full name: EI/LEI = Engenharia Informática, CD = Ciência de Dados, EEC = Engenharia Eletrotécnica e de Computadores, EGI = Engenharia e Gestão Industrial, EM = Engenharia Mecânica, EC = Engenharia Civil, EQ = Engenharia Química, EER/ER = Engenharia de Energias Renováveis, TB = Tecnologia Biomédica, TDG = Tecnologias Digitais e Gestão, GNI = Gestão de Negócios Internacionais. When the student uses a code, answer for that programme.
- If the answer is not in the documents, say so briefly and point the student to the most relevant IPB office, school or contact shown in the documents (name, plus email or phone if available).
- Do not invent information, links, or contact details; only use what appears in the documents.
- Never mention document or file names; just give the information.

OFFICIAL DOCUMENTS:
{context_text}"""

    messages = [SystemMessage(content=system)]
    if history:
        for turn in history[-16:]:
            if turn["role"] == "user":
                messages.append(HumanMessage(content=turn["content"]))
            else:
                messages.append(AIMessage(content=turn["content"]))
    messages.append(HumanMessage(content=user_query))

    try:
        answer = _model().invoke(messages).content
    except Exception as e:
        if "rate_limit" in str(e) or "429" in str(e):
            return {"answer": "⚠️ IPBot has reached today's usage limit. Please try again in a little while.", "sources": []}
        return {"answer": "⚠️ Sorry, something went wrong while answering. Please try again.", "sources": []}

    # collect the official sources as short, de-duplicated links
    src_list, seen_urls = [], set()
    for name in sources:
        url = get_source_url(name, cats.get(name, ""))
        if url in seen_urls:
            continue
        seen_urls.add(url)
        label = re.sub(r"^https?://(www\.)?", "", url).split("/")[0]
        src_list.append({"label": label, "url": url})
    return {"answer": answer, "sources": src_list}

if __name__ == "__main__":
    print("\n--- IPBot Integrated Engine (Manual Mode) ---")
    test_q = "When does the first semester start?"
    print(f"Searching official documents for: '{test_q}'...")
    try:
        result = get_ipbot_response(test_q)
        print(f"\nIPBot Answer:\n{result['answer']}\nSources: {result['sources']}")
    except Exception as e:
        print(f"\nError: {e}")
