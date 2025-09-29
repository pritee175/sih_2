import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './HomePage.css';

import { mockUsers } from '../data/mockData';
import { useAuthStore } from '../store/useAuthStore';

const HomePage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Check username and password directly for all users in mockUsers
    const user = mockUsers.find(u => u.username === username && password === (u.username === 'ramesh' ? 'ramesh123' : u.username === 'dilip' ? 'dilip123' : ''));
    // If not found, try exact match (for copy-paste)
    const userExact = mockUsers.find(u => u.username === username && password === (username === 'ramesh' ? 'ramesh123' : username === 'dilip' ? 'dilip123' : ''));
    const finalUser = user || userExact;
    if (finalUser) {
      login(finalUser, 'mock-token');
      setError('');
      navigate('/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="homepage-container">
      <div className="homepage-left">
  <img src="/kochi-metro.png.png" alt="Kochi Metro Train" className="metro-logo" style={{ maxWidth: '350px', width: '100%', borderRadius: '18px', marginBottom: 24, background: '#fff', objectFit: 'contain', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)' }} />
        <h1 style={{ marginTop: 0, fontSize: 40, fontWeight: 800, color: '#fff', letterSpacing: 1, textShadow: '0 2px 8px rgba(30,58,138,0.18)' }}>Kochi Metro</h1>
        <p className="homepage-tagline">Connecting the city, powering the future.</p>
        <a href="https://kochimetro.org/" target="_blank" rel="noopener noreferrer" className="official-link">
          Visit Official Website
        </a>
      </div>
      <div className="homepage-right">
        <div className="auth-card">
          <h2>Login</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" style={{ width: '100%', marginTop: 4, marginBottom: 2, fontSize: '1rem', fontWeight: 600, padding: '10px 0' }}>Login</button>
            {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
          </form>
          <div className="demo-credentials">
            <strong>Demo Credentials:</strong>
            <ul style={{ fontSize: '0.95em', margin: '8px 0 0 0', padding: 0, listStyle: 'none' }}>
              <li>Username: <b>ramesh</b> | Password: <b>ramesh123</b></li>
              <li>Username: <b>dilip</b> | Password: <b>dilip123</b></li>
            </ul>
          </div>
          <p className="switch-auth">Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
      </div>

    </div>
  );
};

export default HomePage;

