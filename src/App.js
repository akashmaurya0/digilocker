import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Home';
import Register from './Components/Register';
import Login from './Components/Login';
import Upload from './Components/Upload'; // Import the Upload component
import FetchUserData from './Components/FetchUserData';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/upload" element={<Upload />} /> {/* Add the upload route */}
                <Route path="/fetch" element={<FetchUserData />} /> 
            </Routes>
        </Router>
    );
}

export default App;
