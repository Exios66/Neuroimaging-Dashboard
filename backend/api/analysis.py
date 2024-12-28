import numpy as np
from scipy import stats
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier
import pandas as pd
from typing import Dict, List, Tuple, Optional

from backend.database.models import Subject, Scan
from backend.app import db

class AnalysisService:
    """Service for advanced neuroimaging analysis."""

    @staticmethod
    def get_volume_analysis(group_by: str) -> Dict:
        """Get volume analysis grouped by a specific factor."""
        query = db.session.query(
            Subject.diagnosis, Subject.sex, Subject.age,
            Scan.gray_matter_volume,
            Scan.white_matter_volume,
            Scan.csf_volume,
            Scan.total_brain_volume
        ).join(Scan)
        
        df = pd.read_sql(query.statement, db.session.bind)
        
        # Add age groups
        df['age_group'] = pd.cut(df['age'], bins=[0, 30, 50, 70, 100], 
                                labels=['0-30', '31-50', '51-70', '70+'])
        
        # Group data
        grouped_data = df.groupby(group_by)['total_brain_volume'].agg(list).to_dict()
        
        # Perform statistical tests
        stats_results = AnalysisService._perform_statistical_tests(grouped_data)
        
        return {
            'volumes': df['total_brain_volume'].tolist(),
            'groups': df[group_by].tolist(),
            'statistics': stats_results
        }

    @staticmethod
    def get_correlation_analysis() -> Dict:
        """Analyze correlations between different brain measurements."""
        query = db.session.query(
            Scan.gray_matter_volume,
            Scan.white_matter_volume,
            Scan.csf_volume,
            Subject.age
        ).join(Subject)
        
        df = pd.read_sql(query.statement, db.session.bind)
        
        # Calculate correlation matrix
        corr_matrix = df.corr()
        
        # Perform significance tests
        significance_matrix = AnalysisService._calculate_correlation_significance(df)
        
        return {
            'correlation_matrix': corr_matrix.to_dict(),
            'significance': significance_matrix,
            'scatter_data': {
                'x': df['gray_matter_volume'].tolist(),
                'y': df['white_matter_volume'].tolist(),
                'age': df['age'].tolist()
            }
        }

    @staticmethod
    def get_longitudinal_analysis(subject_id: int) -> Dict:
        """Analyze changes over time for a specific subject."""
        scans = Scan.query.filter_by(subject_id=subject_id).order_by(Scan.acquisition_date).all()
        
        if not scans:
            return {}
            
        volumes = [scan.total_brain_volume for scan in scans]
        dates = [scan.acquisition_date for scan in scans]
        
        # Calculate rate of change
        if len(volumes) > 1:
            time_diff = [(dates[i] - dates[0]).days / 365.0 for i in range(len(dates))]
            slope, intercept, r_value, p_value, std_err = stats.linregress(time_diff, volumes)
        else:
            slope = intercept = r_value = p_value = std_err = None
            
        return {
            'volumes': volumes,
            'dates': dates,
            'regression': {
                'slope': slope,
                'intercept': intercept,
                'r_squared': r_value ** 2 if r_value else None,
                'p_value': p_value,
                'std_err': std_err
            }
        }

    @staticmethod
    def get_classification_analysis(target: str = 'diagnosis') -> Dict:
        """Perform machine learning classification analysis."""
        # Get features
        query = db.session.query(
            Subject.diagnosis,
            Subject.sex,
            Subject.age,
            Scan.gray_matter_volume,
            Scan.white_matter_volume,
            Scan.csf_volume,
            Scan.total_brain_volume
        ).join(Scan)
        
        df = pd.read_sql(query.statement, db.session.bind)
        
        # Prepare features
        feature_cols = ['age', 'gray_matter_volume', 'white_matter_volume', 
                       'csf_volume', 'total_brain_volume']
        X = df[feature_cols].values
        y = df[target].values
        
        # Standardize features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Perform PCA
        pca = PCA(n_components=2)
        X_pca = pca.fit_transform(X_scaled)
        
        # Train classifier
        clf = RandomForestClassifier(n_estimators=100, random_state=42)
        cv_scores = cross_val_score(clf, X_scaled, y, cv=5)
        
        # Get feature importance
        clf.fit(X_scaled, y)
        importance = dict(zip(feature_cols, clf.feature_importances_))
        
        return {
            'pca_results': {
                'x': X_pca[:, 0].tolist(),
                'y': X_pca[:, 1].tolist(),
                'labels': y.tolist(),
                'explained_variance': pca.explained_variance_ratio_.tolist()
            },
            'classification_performance': {
                'cv_scores': cv_scores.tolist(),
                'mean_accuracy': cv_scores.mean(),
                'std_accuracy': cv_scores.std()
            },
            'feature_importance': importance
        }

    @staticmethod
    def _perform_statistical_tests(grouped_data: Dict) -> Dict:
        """Perform statistical tests on grouped data."""
        # Convert to list of lists for statistical testing
        groups = list(grouped_data.values())
        
        # Perform one-way ANOVA if more than 2 groups
        if len(groups) > 2:
            f_stat, p_value = stats.f_oneway(*groups)
            test_name = 'ANOVA'
        # Perform t-test if exactly 2 groups
        elif len(groups) == 2:
            t_stat, p_value = stats.ttest_ind(*groups)
            test_name = 't-test'
        else:
            return {}
            
        # Calculate effect size (Cohen's d for 2 groups, eta-squared for >2 groups)
        if len(groups) == 2:
            effect_size = AnalysisService._cohens_d(*groups)
            effect_size_name = "Cohen's d"
        else:
            effect_size = AnalysisService._eta_squared(groups)
            effect_size_name = "Eta-squared"
            
        return {
            'test_name': test_name,
            'p_value': p_value,
            'effect_size': effect_size,
            'effect_size_name': effect_size_name
        }

    @staticmethod
    def _calculate_correlation_significance(df: pd.DataFrame) -> Dict:
        """Calculate significance of correlations."""
        n = len(df)
        corr_matrix = df.corr()
        
        # Calculate p-values for correlations
        p_matrix = pd.DataFrame(np.zeros_like(corr_matrix), 
                              index=corr_matrix.index, 
                              columns=corr_matrix.columns)
                              
        for i in corr_matrix.index:
            for j in corr_matrix.columns:
                if i != j:
                    r = corr_matrix.loc[i, j]
                    t = r * np.sqrt((n-2)/(1-r**2))
                    p_matrix.loc[i, j] = 2 * (1 - stats.t.cdf(abs(t), n-2))
                    
        return p_matrix.to_dict()

    @staticmethod
    def _cohens_d(group1: List[float], group2: List[float]) -> float:
        """Calculate Cohen's d effect size."""
        n1, n2 = len(group1), len(group2)
        var1, var2 = np.var(group1, ddof=1), np.var(group2, ddof=1)
        
        # Pooled standard deviation
        pooled_se = np.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2))
        
        return (np.mean(group1) - np.mean(group2)) / pooled_se

    @staticmethod
    def _eta_squared(groups: List[List[float]]) -> float:
        """Calculate eta-squared effect size."""
        all_values = [val for group in groups for val in group]
        grand_mean = np.mean(all_values)
        
        # Calculate SS_between
        ss_between = sum(len(group) * (np.mean(group) - grand_mean)**2 
                        for group in groups)
        
        # Calculate SS_total
        ss_total = sum((x - grand_mean)**2 for x in all_values)
        
        return ss_between / ss_total if ss_total != 0 else 0 