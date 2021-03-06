import React from 'react';
import ReactDOM from 'react-dom';
import firebase from  './firebase';
import 'semantic-ui-css/semantic.min.css'

import Spinner from './Spinner';
import App from './components/App';
import Login from './components/Login';
import Register from './components/Register';

import { BrowserRouter as Router, Switch, Route, withRouter } from 'react-router-dom';

import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
 
import { setUser, clearUser } from './actions'
import rootReducer from './reducers'

const store = createStore((rootReducer), composeWithDevTools());

class Root extends React.Component {
    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
          if (user) {
            console.log(user)
            this.props.setUser(user);
            this.props.history.push("/");
          } else {
              this.props.history.push('/login');
              this.props.clearUser();
          }
        })
      }
    render() {
        return this.props.isLoading ? <Spinner /> : (
            <Router>
                <Switch>
                    <Route exact path="/" component={ App }/>
                    <Route path="/login" component={ Login }/>
                    <Route path="/register" component={ Register }/>
                </Switch>
            </Router>
        )
    }
}

const mapStateToProps = state => ({
    isLoading: state.user.isLoading
});

const RootWithAuth = withRouter(
    connect(
        mapStateToProps, 
        { setUser, clearUser }
    )(Root)
);

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <RootWithAuth />
        </Router>
    </Provider>
, document.getElementById('root'));
