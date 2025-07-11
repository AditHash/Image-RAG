from flask import Flask
from flask_cors import CORS
from config import Config
import logging
from dotenv import load_dotenv


logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()
app = Flask(__name__)
CORS(app)
app.config.from_object(Config)


from routes import register_routes
register_routes(app)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
