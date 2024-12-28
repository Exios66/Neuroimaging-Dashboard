from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

from config.config import config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

def create_app(config_name='default'):
    """Application factory function."""
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize CORS
    CORS(app, resources={r"/api/*": {"origins": app.config['FRONTEND_URL']}})

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints
    from backend.api.routes import api_bp
    app.register_blueprint(api_bp, url_prefix=app.config['API_PREFIX'])

    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}, 200

    return app

if __name__ == '__main__':
    app = create_app()
    app.run() 