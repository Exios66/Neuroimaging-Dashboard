import React, { useState, useEffect } from 'react';
import {
  Paper,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  makeStyles,
  CircularProgress,
  Tabs,
  Tab,
  Box,
  Tooltip,
  Card,
  CardContent,
} from '@material-ui/core';
import Plot from 'react-plotly.js';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 200,
  },
  plot: {
    width: '100%',
    height: '500px',
  },
  controls: {
    marginBottom: theme.spacing(3),
  },
  tabPanel: {
    marginTop: theme.spacing(2),
  },
  statsCard: {
    height: '100%',
  },
  tooltip: {
    fontSize: '14px',
  },
}));

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

function Analysis() {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [analysisType, setAnalysisType] = useState('volume');
  const [groupBy, setGroupBy] = useState('diagnosis');
  const [data, setData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [classificationResults, setClassificationResults] = useState(null);
  const [correlationData, setCorrelationData] = useState(null);

  useEffect(() => {
    fetchAnalysisData();
  }, [analysisType, groupBy, tabValue]);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      let responses;

      switch (tabValue) {
        case 0: // Volume Analysis
          responses = await Promise.all([
            axios.get(`/api/v1/analysis/${analysisType}`, {
              params: { group_by: groupBy },
            }),
            axios.get(`/api/v1/analysis/${analysisType}/stats`, {
              params: { group_by: groupBy },
            }),
          ]);
          setData(responses[0].data);
          setStatistics(responses[1].data);
          break;

        case 1: // Classification
          const classResponse = await axios.get('/api/v1/analysis/classification', {
            params: { target: groupBy },
          });
          setClassificationResults(classResponse.data);
          break;

        case 2: // Correlation
          const corrResponse = await axios.get('/api/v1/analysis/correlation');
          setCorrelationData(corrResponse.data);
          break;
      }

      setLoading(false);
    } catch (err) {
      setError('Error fetching analysis data');
      setLoading(false);
      console.error('Error fetching analysis data:', err);
    }
  };

  const renderVolumeAnalysis = () => {
    if (!data) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Plot
            data={[
              {
                type: 'box',
                y: data.volumes,
                x: data.groups,
                name: 'Brain Volumes',
                boxpoints: 'all',
                jitter: 0.3,
                pointpos: -1.8,
              },
            ]}
            layout={{
              title: `Brain Volume Distribution by ${groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}`,
              yaxis: { title: 'Volume (mm³)' },
              xaxis: { title: groupBy.charAt(0).toUpperCase() + groupBy.slice(1) },
              height: 500,
            }}
            className={classes.plot}
          />
        </Grid>

        {/* Statistical Results */}
        {data.statistics && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card className={classes.statsCard}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Statistical Test
                  </Typography>
                  <Typography variant="body1">
                    {data.statistics.test_name}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    p-value
                  </Typography>
                  <Typography variant="body1">
                    {data.statistics.p_value.toFixed(4)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className={classes.statsCard}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Effect Size
                  </Typography>
                  <Typography variant="body1">
                    {data.statistics.effect_size_name}: {data.statistics.effect_size.toFixed(4)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Grid>
    );
  };

  const renderClassification = () => {
    if (!classificationResults) return null;

    return (
      <Grid container spacing={3}>
        {/* PCA Plot */}
        <Grid item xs={12} md={6}>
          <Plot
            data={[
              {
                type: 'scatter',
                mode: 'markers',
                x: classificationResults.pca_results.x,
                y: classificationResults.pca_results.y,
                text: classificationResults.pca_results.labels,
                marker: {
                  color: classificationResults.pca_results.labels,
                  size: 10,
                },
              },
            ]}
            layout={{
              title: 'PCA Analysis',
              xaxis: { title: 'First Principal Component' },
              yaxis: { title: 'Second Principal Component' },
              height: 500,
            }}
            className={classes.plot}
          />
        </Grid>

        {/* Feature Importance */}
        <Grid item xs={12} md={6}>
          <Plot
            data={[
              {
                type: 'bar',
                x: Object.keys(classificationResults.feature_importance),
                y: Object.values(classificationResults.feature_importance),
              },
            ]}
            layout={{
              title: 'Feature Importance',
              xaxis: { title: 'Features' },
              yaxis: { title: 'Importance' },
              height: 500,
            }}
            className={classes.plot}
          />
        </Grid>

        {/* Classification Performance */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Classification Performance
              </Typography>
              <Typography>
                Mean Accuracy: {(classificationResults.classification_performance.mean_accuracy * 100).toFixed(2)}%
              </Typography>
              <Typography>
                Standard Deviation: {(classificationResults.classification_performance.std_accuracy * 100).toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderCorrelation = () => {
    if (!correlationData) return null;

    return (
      <Grid container spacing={3}>
        {/* Correlation Matrix */}
        <Grid item xs={12}>
          <Plot
            data={[
              {
                type: 'heatmap',
                z: Object.values(correlationData.correlation_matrix).map(row => Object.values(row)),
                x: Object.keys(correlationData.correlation_matrix),
                y: Object.keys(correlationData.correlation_matrix),
                colorscale: 'RdBu',
                zmin: -1,
                zmax: 1,
              },
            ]}
            layout={{
              title: 'Correlation Matrix',
              height: 500,
              annotations: correlationData.significance,
            }}
            className={classes.plot}
          />
        </Grid>

        {/* Scatter Plot */}
        <Grid item xs={12}>
          <Plot
            data={[
              {
                type: 'scatter',
                mode: 'markers',
                x: correlationData.scatter_data.x,
                y: correlationData.scatter_data.y,
                text: correlationData.scatter_data.age,
                marker: {
                  color: correlationData.scatter_data.age,
                  colorscale: 'Viridis',
                  showscale: true,
                },
              },
            ]}
            layout={{
              title: 'Gray Matter vs White Matter Volume',
              xaxis: { title: 'Gray Matter Volume (mm³)' },
              yaxis: { title: 'White Matter Volume (mm³)' },
              height: 500,
            }}
            className={classes.plot}
          />
        </Grid>
      </Grid>
    );
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>
        Analysis Dashboard
      </Typography>

      <Paper className={classes.paper}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Volume Analysis" />
          <Tab label="Classification" />
          <Tab label="Correlation Analysis" />
        </Tabs>

        <div className={classes.controls}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl className={classes.formControl}>
                <InputLabel>Analysis Type</InputLabel>
                <Select
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value)}
                >
                  <MenuItem value="volume">Brain Volume Analysis</MenuItem>
                  <MenuItem value="correlation">Volume Correlations</MenuItem>
                  <MenuItem value="asymmetry">Brain Asymmetry</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl className={classes.formControl}>
                <InputLabel>Group By</InputLabel>
                <Select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                >
                  <MenuItem value="diagnosis">Diagnosis</MenuItem>
                  <MenuItem value="sex">Sex</MenuItem>
                  <MenuItem value="age_group">Age Group</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </div>

        <TabPanel value={tabValue} index={0}>
          {renderVolumeAnalysis()}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {renderClassification()}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {renderCorrelation()}
        </TabPanel>
      </Paper>
    </div>
  );
}

export default Analysis; 