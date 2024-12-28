from flask import Blueprint, jsonify, request
from backend.database.models import Subject, Scan
from backend.app import db

api_bp = Blueprint('api', __name__)

@api_bp.route('/subjects', methods=['GET'])
def get_subjects():
    """Get all subjects."""
    subjects = Subject.query.all()
    return jsonify([subject.to_dict() for subject in subjects])

@api_bp.route('/subjects/<subject_id>', methods=['GET'])
def get_subject(subject_id):
    """Get a specific subject."""
    subject = Subject.query.get_or_404(subject_id)
    return jsonify(subject.to_dict())

@api_bp.route('/scans', methods=['GET'])
def get_scans():
    """Get all scans."""
    scans = Scan.query.all()
    return jsonify([scan.to_dict() for scan in scans])

@api_bp.route('/scans/<scan_id>', methods=['GET'])
def get_scan(scan_id):
    """Get a specific scan."""
    scan = Scan.query.get_or_404(scan_id)
    return jsonify(scan.to_dict())

@api_bp.route('/analysis/volume', methods=['GET'])
def get_volume_analysis():
    """Get volume analysis for a specific subject."""
    subject_id = request.args.get('subject_id')
    if not subject_id:
        return jsonify({'error': 'subject_id is required'}), 400
    
    # TODO: Implement volume analysis
    return jsonify({'message': 'Volume analysis endpoint'}) 