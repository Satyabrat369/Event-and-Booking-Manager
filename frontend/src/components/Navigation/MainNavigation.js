import React from "react";
import {NavLink} from 'react-router-dom';
import './MainNavigation.css';

const mainNavigation = props =>(
    <header className="main-navigation">
        <div className="main-navigation_logo">
            <h1>EasyEvent</h1>
        </div>
        <nav className="main-navigation_items">
            <ul>
                {!props.token && <li><NavLink to="/auth">Authentication</NavLink></li>}
                <li><NavLink to="/events">Events</NavLink></li>
                {props.token && 
                <>
                <li><NavLink to="/bookings">Bookings</NavLink></li>
                <li><button onClick={props.logout}>Logout</button></li>
                </>
                }
            </ul>
        </nav>
    </header>
);

export default mainNavigation;