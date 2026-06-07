from langchain_huggingface import HuggingFaceEmbeddings
class PrefixedEmbeddings(HuggingFaceEmbeddings):
    def embed_documents(self, texts):
        return super().embed_documents([f"passage: {t}" for t in texts])
    def embed_query(self, text):
        return super().embed_query(f"query: {text}")
def get_embeddings():
    return PrefixedEmbeddings(
        model_name="intfloat/multilingual-e5-small",
        encode_kwargs={"normalize_embeddings": True},
    )
