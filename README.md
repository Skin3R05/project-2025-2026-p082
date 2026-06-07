---
title: IPBot
emoji: 🎓
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# IPBot – A Student Companion for Academic Information

## Project Description
IPBot is an intelligent chatbot designed for the students of the **Instituto Politécnico de Bragança (IPB)**. Using **Retrieval-Augmented Generation (RAG)**, the system retrieves accurate and verified information from official university documents (Academic Calendars, Social Services regulations, and School Guides) to answer student queries in real-time.

## Authors
* **Natalia Czeczot Gawrak** (m323004)
* **Saba Matcharashvili** (a67724)

## Tech Stack
* **Language:** Python 3.11+
* **Orchestration:** LangChain
* **Vector DB:** ChromaDB
* **Embeddings:** HuggingFace `intfloat/multilingual-e5-small`
* **LLM:** Groq – Llama 3.3 70B
* **Backend:** FastAPI (`api.py`)
* **Frontend:** custom HTML / CSS / JavaScript (`frontend/`)

## How it works
1. Official documents in `Knowledge_Base/` are split into smaller chunks.
2. Each chunk is turned into a vector with the HuggingFace embedding model and stored in ChromaDB.
3. A student question is cleaned up, embedded the same way (working across languages), and matched against the stored chunks.
4. The most relevant chunks are sent to the LLM, which answers in the student's language using only that information and links the official source.

## Setup
```bash
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
```
Create a `.env` file in the project root with your Groq API key:
```
GROQ_API_KEY=gsk_your_key_here
```
A free key is available at https://console.groq.com.

## Usage
Build the vector database from the documents (only needed the first time, or after changing the documents):
```bash
python run_pipeline.py
```
Start the web app:
```bash
uvicorn api:app --host 0.0.0.0 --port 7860
```
Then open http://localhost:7860 in your browser.
