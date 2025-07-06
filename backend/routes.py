

from flask import request, send_from_directory, jsonify
import os
from utils import embed_images, query_images, get_collections_and_data
from config import Config
from qdrant_client import QdrantClient

def register_routes(app):
    @app.route("/embed", methods=["POST"])
    def embed_endpoint():
        return embed_images(request)

    @app.route("/query", methods=["POST"])
    def query_endpoint():
        return query_images(request)

    # Serve images from /images directory
    @app.route("/images/<path:filename>", methods=["GET"])
    def serve_image(filename):
        images_dir = "/app/images"
        return send_from_directory(images_dir, filename)

    # Health check route
    @app.route("/health", methods=["GET"])
    def health_check():
        # Check backend and DB status
        try:
            # Try to connect to Qdrant and get collections
            qdrant = QdrantClient(Config.QDRANT_HOST, port=Config.QDRANT_PORT)
            collections = qdrant.get_collections().collections
            db_status = "ok"
        except Exception as e:
            collections = []
            db_status = f"error: {str(e)}"
        return jsonify({
            "backend": "ok",
            "db_status": db_status,
            "collections": [c.name for c in collections] if collections else []
        })

    # Route to get all collections and their data
    @app.route("/collections", methods=["GET"])
    def get_all_collections():
        return get_collections_and_data()
