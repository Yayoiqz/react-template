import React from 'react';
import { Router } from 'react-router-dom';
import { Route, Switch } from 'react-router';
import { history } from '@/router';
import Login from '@/pages/Login';
import Index from '@/pages/Index';

class App extends React.PureComponent {
  render() {
    return (
      <Router history={history}>
        <Switch>
          <Route
            component={Login}
            key="/login"
            path="/login"
          />
          <Route
            component={Index}
            key="/index"
            path="/index"
          />
        </Switch>
      </Router>
    );
  }
}
export default App;
