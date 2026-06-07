from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_documents(documents):
    print("Chunking documents...")
    splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=120)

    chunked_docs = []
    for doc in documents:
        if doc.metadata.get("category") == "Schedules":
            header = doc.page_content.split("\n", 1)[0].strip()
            for piece in splitter.split_documents([doc]):
                if header and not piece.page_content.lstrip().startswith(header[:30]):
                    piece.page_content = header + "\n" + piece.page_content
                chunked_docs.append(piece)
        else:
            chunked_docs.extend(splitter.split_documents([doc]))

    print(f"Created {len(chunked_docs)} chunks.")
    return chunked_docs
