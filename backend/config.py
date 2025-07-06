import os

class Config:
    QDRANT_HOST = os.environ.get("QDRANT_HOST", "qdrant")
    QDRANT_PORT = int(os.environ.get("QDRANT_PORT", 6333))
    COLLECTION_NAME = os.environ.get("QDRANT_COLLECTION", "photos")
    VECTOR_SIZE = int(os.environ.get("QDRANT_VECTOR_SIZE", 512))
    DEVICE = os.environ.get("USE_CUDA", "cpu")  # Always use 'cpu' unless explicitly set to 'cuda'
