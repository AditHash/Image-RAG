import logging
import torch
import open_clip
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest
import numpy as np
from PIL import Image
import uuid
from flask import jsonify
from config import Config

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s')
logger = logging.getLogger(__name__)

# Model and DB setup

device = Config.DEVICE
logger.info(f"Loading OpenCLIP model on device: {device}")
model, _, preprocess = open_clip.create_model_and_transforms(
    'ViT-B-32',
    pretrained='laion2b_e16'
)
tokenizer = open_clip.get_tokenizer('ViT-B-32')
model.to(device)
logger.info("OpenCLIP model loaded successfully.")

qdrant = QdrantClient(Config.QDRANT_HOST, port=Config.QDRANT_PORT)
collection_name = Config.COLLECTION_NAME
vector_size = Config.VECTOR_SIZE

def ensure_collection():
    existing_collections = qdrant.get_collections().collections
    collection_names = [c.name for c in existing_collections]
    if collection_name not in collection_names:
        logger.info(f"Creating Qdrant collection: {collection_name}")
        qdrant.recreate_collection(
            collection_name=collection_name,
            vectors_config=rest.VectorParams(
                size=vector_size,
                distance=rest.Distance.COSINE
            )
        )
    else:
        logger.info(f"Qdrant collection already exists: {collection_name}")

def embed_images(request):
    ensure_collection()
    if 'files' not in request.files:
        logger.warning("No files uploaded in /embed request")
        return jsonify({"error": "No files uploaded. Use 'files' as the form field name and send multiple files."}), 400
    files = request.files.getlist('files')
    if not files:
        logger.warning("Empty file list in /embed request")
        return jsonify({"error": "No files provided."}), 400
    results = []
    errors = []
    images_dir = '/app/images'
    import os
    os.makedirs(images_dir, exist_ok=True)
    for file in files:
        logger.info(f"Received file for embedding: {file.filename}")
        try:
            # Save file to images_dir
            save_path = os.path.join(images_dir, file.filename)
            file.save(save_path)
            image = Image.open(save_path).convert("RGB")
            image_tensor = preprocess(image).unsqueeze(0).to(device)
            with torch.no_grad():
                image_embedding = model.encode_image(image_tensor).cpu().numpy()
                image_embedding /= np.linalg.norm(image_embedding)
            payload = {"filename": file.filename}
            qdrant.upsert(
                collection_name=collection_name,
                points=[
                    rest.PointStruct(
                        id=str(uuid.uuid4()),
                        vector=image_embedding[0].tolist(),
                        payload=payload
                    )
                ]
            )
            logger.info(f"Image embedded, stored, and saved: {file.filename}")
            results.append({"filename": file.filename, "status": "success"})
        except Exception as e:
            logger.error(f"Error embedding image {file.filename}: {e}")
            errors.append({"filename": file.filename, "error": str(e)})
    response = {"results": results}
    if errors:
        response["errors"] = errors
    return jsonify(response)

def query_images(request):
    ensure_collection()
    data = request.get_json()
    if not data or 'query' not in data:
        logger.warning("No query provided in /query request")
        return jsonify({"error": "No query provided"}), 400
    query_text = data['query']
    logger.info(f"Received query: {query_text}")
    try:
        tokenized = tokenizer([query_text]).to(device)
        with torch.no_grad():
            text_embedding = model.encode_text(tokenized).cpu().numpy()
            text_embedding /= np.linalg.norm(text_embedding)
        hits = qdrant.search(
            collection_name=collection_name,
            query_vector=text_embedding[0].tolist(),
            limit=5
        )
        results = [
            {"payload": hit.payload, "score": hit.score}
            for hit in hits
        ]
        logger.info(f"Query returned {len(results)} results")
        return jsonify({"results": results})
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        return jsonify({"error": str(e)}), 500
