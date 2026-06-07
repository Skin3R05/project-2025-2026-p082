from langchain_chroma import Chroma
from src.embeddings import get_embeddings

def run_search():
    embeddings = get_embeddings()
    
    # load vector db from local storage
    vectorstore = Chroma(
        persist_directory="./vector_db", 
        embedding_function=embeddings
    )
    print("\n--- Semantic Search CLI ---")
    while True:
        query = input("Enter your search query: ")
        
        # stop the program if the user types exit
        if query.lower() == 'exit':
            break
            
        # find the 3 most relevant document chunks
        results = vectorstore.similarity_search(query, k=3)
        print(f"\n--- Top 3 Results for: '{query}' ---\n") 
        for i, result in enumerate(results):
            text = result.page_content
            category = result.metadata.get('category', 'Unknown')
            source = result.metadata.get('source', 'Unknown')
            print(f"RESULT {i+1}:")
            print(f"Category:  {category}")
            print(f"Source:    {source}")
            print(f"Text:      {text}")
            print("-" * 50)
            print("\n")

if __name__ == "__main__":
    run_search()