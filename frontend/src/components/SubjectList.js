import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  makeStyles,
  Button,
  Grid,
} from '@material-ui/core';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  filterContainer: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  searchField: {
    marginRight: theme.spacing(2),
  },
  tableRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

function SubjectList() {
  const classes = useStyles();
  const history = useHistory();
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    filterSubjects();
  }, [searchTerm, subjects]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/api/v1/subjects');
      setSubjects(response.data);
      setFilteredSubjects(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching subjects');
      setLoading(false);
      console.error('Error fetching subjects:', err);
    }
  };

  const filterSubjects = () => {
    const filtered = subjects.filter((subject) =>
      subject.subject_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubjects(filtered);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRowClick = (subjectId) => {
    history.push(`/subjects/${subjectId}`);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div className={classes.root}>
      <Paper className={classes.filterContainer}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              className={classes.searchField}
              label="Search Subjects"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => history.push('/subjects/new')}
            >
              Add New Subject
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper className={classes.paper}>
        <TableContainer>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Subject ID</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Sex</TableCell>
                <TableCell>Handedness</TableCell>
                <TableCell>Diagnosis</TableCell>
                <TableCell>Scans</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubjects
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((subject) => (
                  <TableRow
                    key={subject.id}
                    className={classes.tableRow}
                    onClick={() => handleRowClick(subject.id)}
                  >
                    <TableCell>{subject.subject_id}</TableCell>
                    <TableCell>{subject.age}</TableCell>
                    <TableCell>{subject.sex}</TableCell>
                    <TableCell>{subject.handedness}</TableCell>
                    <TableCell>{subject.diagnosis}</TableCell>
                    <TableCell>{subject.scans?.length || 0}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredSubjects.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}

export default SubjectList; 