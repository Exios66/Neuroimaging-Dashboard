from datetime import datetime
from backend.app import db

class Subject(db.Model):
    """Subject model for storing participant information."""
    __tablename__ = 'subjects'

    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.String(50), unique=True, nullable=False)
    age = db.Column(db.Integer)
    sex = db.Column(db.String(1))  # 'M' or 'F'
    handedness = db.Column(db.String(1))  # 'R' or 'L'
    diagnosis = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    scans = db.relationship('Scan', backref='subject', lazy=True)

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            'id': self.id,
            'subject_id': self.subject_id,
            'age': self.age,
            'sex': self.sex,
            'handedness': self.handedness,
            'diagnosis': self.diagnosis,
            'created_at': self.created_at.isoformat()
        }

class Scan(db.Model):
    """Scan model for storing MRI scan information."""
    __tablename__ = 'scans'

    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False)
    scan_type = db.Column(db.String(50), nullable=False)  # e.g., 'T1', 'fMRI'
    acquisition_date = db.Column(db.DateTime)
    file_path = db.Column(db.String(255), nullable=False)
    processed = db.Column(db.Boolean, default=False)
    processing_date = db.Column(db.DateTime)
    
    # Metadata
    tr = db.Column(db.Float)  # Repetition Time
    te = db.Column(db.Float)  # Echo Time
    field_strength = db.Column(db.Float)  # Tesla
    
    # Analysis Results
    gray_matter_volume = db.Column(db.Float)
    white_matter_volume = db.Column(db.Float)
    csf_volume = db.Column(db.Float)
    total_brain_volume = db.Column(db.Float)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            'id': self.id,
            'subject_id': self.subject_id,
            'scan_type': self.scan_type,
            'acquisition_date': self.acquisition_date.isoformat() if self.acquisition_date else None,
            'file_path': self.file_path,
            'processed': self.processed,
            'processing_date': self.processing_date.isoformat() if self.processing_date else None,
            'tr': self.tr,
            'te': self.te,
            'field_strength': self.field_strength,
            'gray_matter_volume': self.gray_matter_volume,
            'white_matter_volume': self.white_matter_volume,
            'csf_volume': self.csf_volume,
            'total_brain_volume': self.total_brain_volume,
            'created_at': self.created_at.isoformat()
        } 