import os
import shutil
from pathlib import Path
from langchain_chroma import Chroma
from src.embeddings import get_embeddings

DB_DIR = str(Path(__file__).resolve().parent.parent / "vector_db")

def create_vector_store(chunked_docs, persist_directory=DB_DIR):
    print("Initializing embedding model...")
    embeddings = get_embeddings()

    # for preventing duplicates
    if os.path.exists(persist_directory):
        shutil.rmtree(persist_directory)

    print("Saving chunks to ChromaDB...")
    vectorstore = Chroma.from_documents(
        documents=chunked_docs,
        embedding=embeddings,
        persist_directory=persist_directory
    )

    print(f"Database successfully saved to {persist_directory}")
    return vectorstore
