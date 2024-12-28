# Neuroimaging Data Pipeline & Interactive Dashboard

## Overview

A comprehensive platform for processing, analyzing, and visualizing neuroimaging data. This project implements an end-to-end pipeline that processes raw neuroimaging data (fMRI/MRI) from open repositories and provides interactive visualizations through a modern web interface.

## Features

### Data Processing

- Automated data ingestion from OpenNeuro and other open repositories
- Advanced preprocessing pipeline with parallel processing
- Quality control and artifact detection
- Support for multiple imaging modalities (T1, fMRI, DTI)

### Analysis Capabilities

- Volumetric analysis (gray matter, white matter, CSF)
- Statistical analysis with multiple comparison corrections
- Machine learning classification
- Longitudinal analysis
- Region-based analysis using standard atlases

### Visualization

- Interactive 3D brain visualizations
- Statistical plots and heatmaps
- Real-time data exploration
- Customizable dashboards

### Technical Features

- Progressive Web App (PWA) support
- Offline functionality
- Real-time updates via WebSocket
- Background processing for long-running tasks
- Automated quality control reports

## Tech Stack

### Backend

- **Framework**: Python Flask
- **Database**: PostgreSQL
- **Data Processing**:
  - NiBabel for neuroimaging data
  - NumPy/SciPy for numerical computations
  - Scikit-learn for machine learning
  - Nilearn for advanced neuroimaging tools

### Frontend

- **Framework**: React.js
- **UI Components**: Material-UI
- **Visualization**:
  - Plotly.js for statistical plots
  - D3.js for custom visualizations
  - Three.js for 3D rendering

### Infrastructure

- Docker containerization
- Nginx web server
- Redis for caching
- Celery for task queue

## Project Structure

```
neuroimaging-dashboard/
├── backend/                 # Python backend server
│   ├── api/                # REST API endpoints
│   │   ├── routes.py       # API route definitions
│   │   └── analysis.py     # Analysis services
│   ├── data_pipeline/      # Data processing pipeline
│   │   ├── pipeline.py     # Main pipeline implementation
│   │   └── processors/     # Individual processing steps
│   └── database/           # Database models and migrations
├── frontend/               # React frontend application
│   ├── public/            # Static assets
│   └── src/               # Source code
│       ├── components/    # React components
│       ├── services/      # API services
│       └── utils/         # Utility functions
├── config/                # Configuration files
├── tests/                # Test suites
├── docs/                 # Documentation
└── docker/              # Docker configuration
```

## Installation

### Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL 13+
- Docker and Docker Compose (optional)
- CUDA-capable GPU (recommended for processing)

### Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/neuroimaging-dashboard.git
   cd neuroimaging-dashboard
   ```

2. Set up the backend:

   ```bash
   # Create and activate virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt

   # Set up environment variables
   cp .env.example .env
   # Edit .env with your configurations

   # Initialize database
   flask db upgrade
   ```

3. Set up the frontend:

   ```bash
   cd frontend
   npm install
   ```

### Docker Setup

1. Build and start services:

   ```bash
   docker-compose up --build
   ```

2. Initialize the database:

   ```bash
   docker-compose exec backend flask db upgrade
   ```

## Usage

### Starting the Application

1. Development mode:

   ```bash
   # Terminal 1 - Backend
   cd backend
   flask run

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

2. Production mode:

   ```bash
   docker-compose up
   ```

### Accessing the Dashboard

- Development: <http://localhost:3000>
- Production: <http://your-domain.com>

### Processing Data

1. Upload neuroimaging data:
   - Supported formats: NIfTI (.nii, .nii.gz), DICOM
   - Batch upload available through web interface
   - API endpoints for programmatic access

2. Configure processing pipeline:
   - Select preprocessing steps
   - Set analysis parameters
   - Choose output formats

3. Monitor progress:
   - Real-time status updates
   - Quality control metrics
   - Error notifications

### Analyzing Results

1. Access analysis tools:
   - Volume analysis
   - Statistical comparisons
   - Machine learning models
   - Longitudinal tracking

2. Customize visualizations:
   - Interactive plots
   - 3D brain renderings
   - Custom ROI analysis

## API Documentation

Detailed API documentation is available at `/docs/api.md`

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| FLASK_ENV | Environment (development/production) | development |
| DATABASE_URL | PostgreSQL connection URL | postgresql://localhost/neuroimaging_dashboard |
| SECRET_KEY | Flask secret key | your-secret-key-here |
| OPENNEURO_API_KEY | OpenNeuro API key | None |

### Application Settings

Configuration files are located in `config/`:

- `config.py`: Main configuration
- `logging.conf`: Logging configuration
- `nginx.conf`: Nginx configuration

## Testing

1. Run backend tests:

   ```bash
   pytest tests/
   ```

2. Run frontend tests:

   ```bash
   cd frontend
   npm test
   ```

## Performance Optimization

### Backend Optimization

- Parallel processing using ThreadPoolExecutor
- Caching with Redis
- Database query optimization
- Efficient file handling

### Frontend Optimization

- Code splitting
- Lazy loading
- Service Worker caching
- WebGL acceleration

## Security

- HTTPS enforcement
- CORS configuration
- JWT authentication
- Input validation
- SQL injection prevention
- XSS protection

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Troubleshooting

Common issues and solutions are documented in [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenNeuro for providing open access to neuroimaging datasets
- The neuroimaging research community
- Contributors and maintainers

## Support

- Issue Tracker: GitHub Issues
- Email: <support@example.com>
- Slack: [Join our community](https://slack.example.com)

## Roadmap

See [ROADMAP.md](docs/ROADMAP.md) for planned features and improvements.
