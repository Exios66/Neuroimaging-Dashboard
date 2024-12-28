"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-04 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create subjects table
    op.create_table(
        'subjects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('subject_id', sa.String(length=50), nullable=False),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('sex', sa.String(length=1), nullable=True),
        sa.Column('handedness', sa.String(length=1), nullable=True),
        sa.Column('diagnosis', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('subject_id')
    )

    # Create scans table
    op.create_table(
        'scans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('subject_id', sa.Integer(), nullable=False),
        sa.Column('scan_type', sa.String(length=50), nullable=False),
        sa.Column('acquisition_date', sa.DateTime(), nullable=True),
        sa.Column('file_path', sa.String(length=255), nullable=False),
        sa.Column('processed', sa.Boolean(), nullable=False, default=False),
        sa.Column('processing_date', sa.DateTime(), nullable=True),
        
        # Metadata
        sa.Column('tr', sa.Float(), nullable=True),
        sa.Column('te', sa.Float(), nullable=True),
        sa.Column('field_strength', sa.Float(), nullable=True),
        
        # Analysis Results
        sa.Column('gray_matter_volume', sa.Float(), nullable=True),
        sa.Column('white_matter_volume', sa.Float(), nullable=True),
        sa.Column('csf_volume', sa.Float(), nullable=True),
        sa.Column('total_brain_volume', sa.Float(), nullable=True),
        
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['subject_id'], ['subjects.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index('idx_scans_subject_id', 'scans', ['subject_id'])
    op.create_index('idx_scans_scan_type', 'scans', ['scan_type'])
    op.create_index('idx_scans_processed', 'scans', ['processed'])

def downgrade():
    op.drop_index('idx_scans_processed', 'scans')
    op.drop_index('idx_scans_scan_type', 'scans')
    op.drop_index('idx_scans_subject_id', 'scans')
    op.drop_table('scans')
    op.drop_table('subjects') 