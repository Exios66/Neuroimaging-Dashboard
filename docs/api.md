# API Documentation

## Overview

The Neuroimaging Dashboard API provides RESTful endpoints for managing neuroimaging data, processing pipelines, and analysis results. All endpoints are prefixed with `/api/v1/`.

## Authentication

Authentication is handled via JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Endpoints

### Subjects

#### GET /subjects

Retrieve all subjects.

**Parameters:**

- `page` (optional): Page number for pagination
- `per_page` (optional): Items per page
- `search` (optional): Search term for filtering

**Response:**

```json
{
  "subjects": [
    {
      "id": 1,
      "subject_id": "sub-001",
      "age": 25,
      "sex": "M",
      "handedness": "R",
      "diagnosis": "control",
      "created_at": "2024-01-04T10:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "per_page": 10
}
```

#### GET /subjects/{id}

Retrieve a specific subject.

**Response:**

```json
{
  "id": 1,
  "subject_id": "sub-001",
  "age": 25,
  "sex": "M",
  "handedness": "R",
  "diagnosis": "control",
  "created_at": "2024-01-04T10:00:00Z",
  "scans": [
    {
      "id": 1,
      "scan_type": "T1",
      "acquisition_date": "2024-01-04T10:00:00Z"
    }
  ]
}
```

#### POST /subjects

Create a new subject.

**Request Body:**

```json
{
  "subject_id": "sub-001",
  "age": 25,
  "sex": "M",
  "handedness": "R",
  "diagnosis": "control"
}
```

### Scans

#### GET /scans

Retrieve all scans.

**Parameters:**

- `subject_id` (optional): Filter by subject
- `scan_type` (optional): Filter by scan type
- `processed` (optional): Filter by processing status

**Response:**

```json
{
  "scans": [
    {
      "id": 1,
      "subject_id": 1,
      "scan_type": "T1",
      "acquisition_date": "2024-01-04T10:00:00Z",
      "processed": true,
      "processing_date": "2024-01-04T11:00:00Z",
      "file_path": "/data/sub-001/T1.nii.gz",
      "metadata": {
        "tr": 2.0,
        "te": 30,
        "field_strength": 3.0
      }
    }
  ]
}
```

#### POST /scans/{id}/process

Trigger processing for a scan.

**Request Body:**

```json
{
  "pipeline_config": {
    "steps": ["bias_correction", "registration", "segmentation"],
    "parameters": {
      "smoothing_kernel": 3
    }
  }
}
```

### Analysis

#### GET /analysis/volume

Get volume analysis results.

**Parameters:**

- `group_by`: Group results by factor (diagnosis, sex, age_group)
- `subject_id` (optional): Filter by subject

**Response:**

```json
{
  "volumes": [1000, 1100, 900],
  "groups": ["control", "control", "patient"],
  "statistics": {
    "test_name": "t-test",
    "p_value": 0.03,
    "effect_size": 0.8,
    "effect_size_name": "Cohen's d"
  }
}
```

#### GET /analysis/correlation

Get correlation analysis results.

**Response:**

```json
{
  "correlation_matrix": {
    "gray_matter_volume": {
      "white_matter_volume": 0.7,
      "age": -0.3
    }
  },
  "significance": {
    "gray_matter_volume": {
      "white_matter_volume": 0.001,
      "age": 0.05
    }
  }
}
```

#### GET /analysis/classification

Get classification analysis results.

**Parameters:**

- `target`: Classification target (diagnosis, sex)

**Response:**

```json
{
  "pca_results": {
    "x": [1.2, -0.8, 0.5],
    "y": [0.3, -0.2, 0.1],
    "labels": ["control", "patient", "control"],
    "explained_variance": [0.7, 0.2]
  },
  "classification_performance": {
    "cv_scores": [0.85, 0.82, 0.88],
    "mean_accuracy": 0.85,
    "std_accuracy": 0.03
  },
  "feature_importance": {
    "age": 0.2,
    "gray_matter_volume": 0.5,
    "white_matter_volume": 0.3
  }
}
```

### Pipeline Management

#### GET /pipeline/status/{job_id}

Get status of a processing job.

**Response:**

```json
{
  "status": "running",
  "progress": 75,
  "current_step": "segmentation",
  "steps_completed": ["bias_correction", "registration"],
  "estimated_time_remaining": 300
}
```

#### POST /pipeline/cancel/{job_id}

Cancel a processing job.

### Data Management

#### POST /data/upload

Upload neuroimaging data.

**Request:**

- Multipart form data with files

**Response:**

```json
{
  "uploaded_files": [
    {
      "filename": "sub-001_T1.nii.gz",
      "size": 10485760,
      "scan_id": 1
    }
  ]
}
```

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

### Common Error Codes

- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid request data
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `PROCESSING_ERROR`: Error during data processing

## Rate Limiting

API requests are limited to:

- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated users

Rate limit headers are included in responses:

```plaintext
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

## Versioning

The API is versioned through the URL path. The current version is v1.
Breaking changes will be introduced in new API versions.

## WebSocket API

Real-time updates are available through WebSocket connections at:

```plaintext
ws://api.example.com/ws
```

### Events

```json
{
  "type": "processing_update",
  "data": {
    "job_id": "123",
    "progress": 75,
    "status": "running"
  }
}
```

## Development and Testing

API endpoints can be tested using the provided Postman collection:

```
docs/postman/neuroimaging-dashboard.postman_collection.json
```
