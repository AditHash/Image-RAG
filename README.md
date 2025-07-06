# Image Search

Search Images in Natural Language

## Description
This project demonstrates fast and lightweight image search using natural language queries.

It leverages the OpenCLIP (ViT-B-32) model, which is optimized for both speed and efficiency, making it suitable for real-time applications and resource-constrained environments. The model generates compact image and text embeddings, enabling rapid similarity search.

Users can search for images by simply describing them in natural language. The backend instantly converts both images and queries into vector representations, and retrieves the most relevant images using a high-performance vector database (Qdrant).

Key features:
- Lightweight and fast model (OpenCLIP ViT-B-32)
- Real-time semantic search
- Scalable and efficient vector storage
- Simple API and modern frontend

## Stack
- **Backend:** Python, Flask
- **Model:** OpenCLIP (ViT-B-32, pretrained on LAION-2B)
    - The backend uses the OpenCLIP implementation of the CLIP model, specifically the ViT-B-32 architecture pretrained on the LAION-2B dataset.
    - Images are embedded using this model, and natural language queries are also embedded to enable semantic search.
- **Frontend:** React, TailwindCSS
- **Database:** Qdrant (open-source vector database)
    - Qdrant is used to store and search high-dimensional image and text embeddings.
    - It enables fast and scalable similarity search for image retrieval based on vector representations.
    - The backend creates a collection in Qdrant, stores image embeddings as vectors, and queries them using cosine similarity.

## Running the Project

### Backend
Build and start the backend using Docker Compose:

```bash
docker compose up --build
```

### Frontend
Start the frontend development server:

```bash
cd frontend
npm install
npm run dev
```
## Architecture and Demo

![Architecture Diagram](./imagesearch.drawio.svg)
![Demo](./demo.webm)


## References
- [Qdrant Vector Database](https://qdrant.tech/qdrant-vector-database/)
- [OpenCLIP (CLIP Transformers)](https://github.com/mlfoundations/open_clip)

