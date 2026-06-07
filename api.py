import io
from pathlib import Path
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from src.engine import get_ipbot_response

ROOT = Path(__file__).resolve().parent
FRONTEND = ROOT / "frontend"
ASSETS = ROOT / "assets"

app = FastAPI(title="IPBot")

class Turn(BaseModel):
    role: str
    content: str

class ChatIn(BaseModel):
    message: str
    history: list[Turn] = []
    doc_text: str = ""

MAX_DOC_CHARS = 6000

@app.post("/api/chat")
def chat(body: ChatIn):
    history = [{"role": t.role, "content": t.content} for t in body.history]
    try:
        return get_ipbot_response(body.message, history, doc_text=body.doc_text[:MAX_DOC_CHARS])
    except Exception as e:
        return {"answer": f"⚠️ Something went wrong: {e}", "sources": []}


@app.post("/api/upload")
async def upload(file: UploadFile = File(...)):
    name = file.filename or "document"
    data = await file.read()
    if len(data) > 5_000_000:
        return {"name": name, "text": "", "error": "File too large (max 5 MB)."}
    suffix = name.lower().rsplit(".", 1)[-1] if "." in name else ""
    text = ""
    try:
        if suffix == "pdf":
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(data))
            text = "\n".join((p.extract_text() or "") for p in reader.pages)
        elif suffix == "docx":
            from docx import Document
            text = "\n".join(p.text for p in Document(io.BytesIO(data)).paragraphs)
        else:
            text = data.decode("utf-8", errors="ignore")
    except Exception as e:
        return {"name": name, "text": "", "error": f"Could not read this file: {e}"}
    text = text.strip()
    if not text:
        return {"name": name, "text": "", "error": "No readable text found in this file."}
    return {"name": name, "text": text[:MAX_DOC_CHARS]}

# static files
app.mount("/assets", StaticFiles(directory=str(ASSETS)), name="assets")
app.mount("/static", StaticFiles(directory=str(FRONTEND)), name="static")

@app.get("/")
def index():
    return FileResponse(str(FRONTEND / "index.html"))
