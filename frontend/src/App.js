import {BrowserRouter, Route, Navigate, Routes} from 'react-router-dom';
import React,{Component} from 'react';
import './App.css';
import EventPage from './pages/Events';
import BookingPage from './pages/Bookings';
import AuthPage  from './pages/Auth';
import MainNavigation from './components/Navigation/MainNavigation'
import ContextFromAuth from './context/context-from-auth';

class App extends Component{
  
  state = {
    userId: null,
    token: null
  }
  login = (userId, token, tokenExpiration) =>{
    this.setState({userId: userId, token: token});
    console.log(this.state.token);
  };
  logout = () =>{
    this.setState({userId: null, token: null});
  };
  render(){
  return (
    <BrowserRouter>
      <>
        <ContextFromAuth.Provider value={{
          userId: this.state.userId,
          token: this.state.token,
          login: this.login,
          logout: this.logout
          }}>
          <MainNavigation token={this.state.token} logout={this.logout}/>
          <main className='main-content'>
            <Routes>
              {!this.state.token && <Route path="/" element={<Navigate to="/auth"/>}/>}
              {/* {!this.state.token && <Route path="/events" element={<Navigate to="/auth"/>}/>} */}
              {!this.state.token && <Route path="/bookings" element={<Navigate to="/auth"/>}/>}
              {this.state.token && <Route path="/" element={<Navigate to="/events"/>}/>}
              {this.state.token && <Route path="/auth" element={<Navigate to="/events"/>}/>}
              {!this.state.token && <Route path="/auth" Component={AuthPage}/>}
              <Route path="/events" Component={EventPage}/>
              {this.state.token && <Route path="/bookings" Component={BookingPage}/>}
            </Routes>
          </main>
        </ContextFromAuth.Provider>
      </>      
    </BrowserRouter>
  );
  }
}

export default App;
