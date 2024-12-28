import os
from pathlib import Path

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent

class Config:
    """Base configuration."""
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    FLASK_APP = 'backend.app'
    FLASK_ENV = 'development'

    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'postgresql://localhost/neuroimaging_dashboard'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # API
    API_PREFIX = '/api/v1'

    # Data Pipeline
    DATA_DIR = BASE_DIR / 'data'
    OPENNEURO_API_URL = 'https://openneuro.org/api/datasets'
    
    # Frontend
    FRONTEND_URL = 'http://localhost:3000'

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    DEVELOPMENT = True

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    DEVELOPMENT = False

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'postgresql://localhost/neuroimaging_dashboard_test'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
} 