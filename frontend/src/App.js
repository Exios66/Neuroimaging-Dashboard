import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

// Components
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import SubjectList from './components/SubjectList';
import SubjectDetail from './components/SubjectDetail';
import Analysis from './components/Analysis';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navigation />
          <main style={{ padding: '20px' }}>
            <Switch>
              <Route exact path="/" component={Dashboard} />
              <Route exact path="/subjects" component={SubjectList} />
              <Route path="/subjects/:id" component={SubjectDetail} />
              <Route path="/analysis" component={Analysis} />
            </Switch>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 