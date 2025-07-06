
from flask import request
from utils import embed_images, query_images

def register_routes(app):
    @app.route("/embed", methods=["POST"])
    def embed_endpoint():
        return embed_images(request)

    @app.route("/query", methods=["POST"])
    def query_endpoint():
        return query_images(request)
