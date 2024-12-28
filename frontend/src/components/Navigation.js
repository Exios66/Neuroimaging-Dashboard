import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  makeStyles,
} from '@material-ui/core';
import DashboardIcon from '@material-ui/icons/Dashboard';
import PeopleIcon from '@material-ui/icons/People';
import AssessmentIcon from '@material-ui/icons/Assessment';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing(1),
  },
  button: {
    marginLeft: theme.spacing(2),
    color: 'white',
  },
}));

function Navigation() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            <DashboardIcon className={classes.icon} />
            Neuroimaging Dashboard
          </Typography>
          
          <Button
            component={RouterLink}
            to="/"
            className={classes.button}
            startIcon={<DashboardIcon />}
          >
            Dashboard
          </Button>
          
          <Button
            component={RouterLink}
            to="/subjects"
            className={classes.button}
            startIcon={<PeopleIcon />}
          >
            Subjects
          </Button>
          
          <Button
            component={RouterLink}
            to="/analysis"
            className={classes.button}
            startIcon={<AssessmentIcon />}
          >
            Analysis
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Navigation; 