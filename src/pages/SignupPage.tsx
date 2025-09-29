import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

import { mockUsers } from '../data/mockData';
import { User } from '../types';
import { useAuthStore } from '../store/useAuthStore';

const roles = [
  'Operations Control Manager',
  'Rolling Stock Manager',
  'Maintenance Engineer',
  'Rolling Stock Inspector',
  'Signaling & Telecom Engineer',
  'Branding & Commercial Manager',
];

const SignupPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    role: roles[0],
  });
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add user to mockUsers (in-memory, for demo only)
    const newUser = {
      id: 'U' + (mockUsers.length + 1).toString().padStart(2, '0'),
      username: form.username,
      role: form.role as User['role'],
      name: form.name,
      depot_access: ['A', 'B'],
      permissions: ['view_all', 'make_decisions', 'override_ai', 'export_data'],
    };
    mockUsers.push(newUser);
    login(newUser, 'mock-token');
    navigate('/dashboard');
  };

  return (
    <div className="homepage-container">
      <div className="homepage-left">
        <img src="/public/kochi-metro-logo.png" alt="Kochi Metro" className="metro-logo" />
        <h1>Kochi Metro</h1>
        <p className="homepage-tagline">Connecting the city, powering the future.</p>
        <a href="https://kochimetro.org/" target="_blank" rel="noopener noreferrer" className="official-link">
          Visit Official Website
        </a>
      </div>
      <div className="homepage-right">
        <div className="auth-card">
          <h2>Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} required />
            <input name="username" type="text" placeholder="Username" value={form.username} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <input name="phone" type="tel" placeholder="Phone No." value={form.phone} onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
            <select name="role" value={form.role} onChange={handleChange} required>
              {roles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <button type="submit">Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
