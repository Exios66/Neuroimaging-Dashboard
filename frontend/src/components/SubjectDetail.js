import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Paper,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  makeStyles,
  CircularProgress,
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
  title: {
    marginBottom: theme.spacing(2),
  },
  button: {
    marginRight: theme.spacing(2),
  },
  scanTable: {
    marginTop: theme.spacing(3),
  },
  plot: {
    width: '100%',
    height: '400px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
}));

function SubjectDetail() {
  const classes = useStyles();
  const { id } = useParams();
  const history = useHistory();
  const [subject, setSubject] = useState(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubjectData();
  }, [id]);

  const fetchSubjectData = async () => {
    try {
      const [subjectResponse, scansResponse] = await Promise.all([
        axios.get(`/api/v1/subjects/${id}`),
        axios.get(`/api/v1/subjects/${id}/scans`),
      ]);

      setSubject(subjectResponse.data);
      setScans(scansResponse.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching subject data');
      setLoading(false);
      console.error('Error fetching subject data:', err);
    }
  };

  const handleProcessScan = async (scanId) => {
    try {
      await axios.post(`/api/v1/scans/${scanId}/process`);
      fetchSubjectData(); // Refresh data
    } catch (err) {
      console.error('Error processing scan:', err);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!subject) return <Typography>Subject not found</Typography>;

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography variant="h4" className={classes.title}>
          Subject Details: {subject.subject_id}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => history.push('/subjects')}
          className={classes.button}
        >
          Back to Subjects
        </Button>
      </div>

      {/* Subject Information */}
      <Paper className={classes.paper}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Demographics
                </Typography>
                <Typography>Age: {subject.age}</Typography>
                <Typography>Sex: {subject.sex}</Typography>
                <Typography>Handedness: {subject.handedness}</Typography>
                <Typography>Diagnosis: {subject.diagnosis}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Brain Volume Analysis
                </Typography>
                {scans.some((scan) => scan.processed) ? (
                  <Plot
                    data={[
                      {
                        type: 'bar',
                        x: ['Gray Matter', 'White Matter', 'CSF'],
                        y: [
                          scans[0].gray_matter_volume,
                          scans[0].white_matter_volume,
                          scans[0].csf_volume,
                        ],
                      },
                    ]}
                    layout={{
                      title: 'Brain Tissue Volumes',
                      yaxis: { title: 'Volume (mm³)' },
                    }}
                    className={classes.plot}
                  />
                ) : (
                  <Typography>No processed scans available</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Scans Table */}
      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom>
          MRI Scans
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Scan Type</TableCell>
                <TableCell>Acquisition Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scans.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell>{scan.scan_type}</TableCell>
                  <TableCell>
                    {new Date(scan.acquisition_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {scan.processed ? 'Processed' : 'Pending'}
                  </TableCell>
                  <TableCell>
                    {!scan.processed && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleProcessScan(scan.id)}
                      >
                        Process
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
}

export default SubjectDetail; 