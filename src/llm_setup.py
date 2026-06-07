import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

def get_llm():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is missing")
    return ChatGroq(
        temperature=0,
        model_name="llama-3.3-70b-versatile",
        groq_api_key=api_key
    )
if __name__ == "__main__":
    llm = get_llm()
    try:
        response = llm.invoke("Hello! Can you confirm you are connected to IPBot?")
        print(f"\n Connected Successfully")
        print(f"Bot Response: {response.content}")
    except Exception as e:
        print(f"\n Connection Failed")
        print(f"Error: {e}")
