import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  makeStyles,
} from '@material-ui/core';
import Plot from 'react-plotly.js';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    height: '100%',
  },
  card: {
    height: '100%',
  },
  plot: {
    width: '100%',
    height: '400px',
  },
}));

function Dashboard() {
  const classes = useStyles();
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalScans: 0,
    processedScans: 0,
  });
  const [volumeData, setVolumeData] = useState([]);

  useEffect(() => {
    // Fetch dashboard data
    const fetchData = async () => {
      try {
        // In a real application, these would be actual API endpoints
        const statsResponse = await axios.get('/api/v1/stats');
        setStats(statsResponse.data);

        const volumeResponse = await axios.get('/api/v1/analysis/volume-summary');
        setVolumeData(volumeResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        {/* Summary Statistics */}
        <Grid item xs={12} md={4}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Subjects
              </Typography>
              <Typography variant="h3">{stats.totalSubjects}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Scans
              </Typography>
              <Typography variant="h3">{stats.totalScans}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Processed Scans
              </Typography>
              <Typography variant="h3">{stats.processedScans}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Brain Volume Distribution */}
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Brain Volume Distribution
            </Typography>
            <Plot
              data={[
                {
                  type: 'box',
                  y: volumeData.map((d) => d.totalVolume),
                  name: 'Total Brain Volume',
                },
              ]}
              layout={{
                title: 'Brain Volume Distribution',
                yaxis: { title: 'Volume (mm³)' },
                height: 400,
              }}
              className={classes.plot}
            />
          </Paper>
        </Grid>

        {/* Processing Status */}
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Processing Status
            </Typography>
            <Plot
              data={[
                {
                  values: [stats.processedScans, stats.totalScans - stats.processedScans],
                  labels: ['Processed', 'Pending'],
                  type: 'pie',
                },
              ]}
              layout={{
                height: 400,
              }}
              className={classes.plot}
            />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default Dashboard; 