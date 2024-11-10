import React from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <section className="intro-section">
                <h1 className="intro-text">Welcome to Our Platform</h1>
                <p className="animated-text">
                    A place to connect, learn, and grow. Join us today!
                </p>
            </section>
            <div className="button-container">
                <button className="register-button" onClick={() => navigate('/register')}>Register</button>
                <button className="login-button" onClick={() => navigate('/login')}>Login</button>
                <button className="login-button" onClick={() => navigate('/fetch')}>FetchUserData</button>
            </div>
        </div>
    );
};

export default Home;
