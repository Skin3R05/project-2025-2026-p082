from src.loader import load_knowledge_base
from src.chunker import chunk_documents
from src.indexer import create_vector_store

def main():
    print("Loading documents...")
    documents = load_knowledge_base()
    if not documents:
        print("No documents found. Nothing to index.")
        return

    chunks = chunk_documents(documents)
    print("Building the vector database...")
    create_vector_store(chunks)
    print(f"Done. {len(chunks)} chunks indexed.")

if __name__ == "__main__":
    main()
