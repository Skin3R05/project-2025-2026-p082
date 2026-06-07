from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader, TextLoader

def load_knowledge_base(kb_dir="Knowledge_Base"):
    """Loads PDF and text files from a directory and tags them with their folder name."""
    project_root = Path(__file__).resolve().parent.parent
    kb_path = project_root / kb_dir
    all_documents = []
    
    # target folder existance check
    if not kb_path.exists():
        print(f"Error: The directory '{kb_path}' does not exist.")
        return []
    print(f"Scanning directory: {kb_path}\n")
    for file_path in kb_path.rglob('*'):
        if file_path.is_file():
            category = file_path.parent.name
            suffix = file_path.suffix.lower()          
            
            # choose the right loader based on the file extension
            loader = None
            if suffix == '.pdf':
                loader = PyPDFLoader(str(file_path))
            elif suffix in ['.txt', '.md']:
                loader = TextLoader(str(file_path), encoding='utf-8')          
            if loader:
                try:
                    docs = loader.load()
                    for doc in docs:
                        doc.metadata['category'] = category   
                    all_documents.extend(docs)
                    print(f"Successfully loaded: [{category}] {file_path.name} ({len(docs)} pages/segments)")   
                except Exception as e:
                    print(f"Failed to load {file_path.name}. Error: {e}")

    # final count of data
    print(f"Total document pages/chunks successfully loaded: {len(all_documents)}")
    
    return all_documents

if __name__ == "__main__":
    load_knowledge_base()
