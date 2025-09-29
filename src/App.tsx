import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { LoginForm } from './components/auth/LoginForm';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import { Dashboard } from './pages/Dashboard';
import { InductionDecisions } from './pages/InductionDecisions';
import { Maintenance } from './pages/Maintenance';
import { Simulator } from './pages/Simulator';
import { Alerts } from './pages/Alerts';
import { Branding } from './pages/Branding';
import { History } from './pages/History';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { DataUpload } from './pages/DataUpload';
import { Scheduling } from './pages/Scheduling';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route 
        path="/" 
        element={<HomePage />} 
      />
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />
        } 
      />
      <Route 
        path="/signup" 
        element={<SignupPage />} 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/data-upload" 
        element={
          <ProtectedRoute>
            <DataUpload />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/scheduling" 
        element={
          <ProtectedRoute>
            <Scheduling />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/induction" 
        element={
          <ProtectedRoute>
            <InductionDecisions />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/maintenance" 
        element={
          <ProtectedRoute>
            <Maintenance />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/simulator" 
        element={
          <ProtectedRoute>
            <Simulator />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/alerts" 
        element={
          <ProtectedRoute>
            <Alerts />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/branding" 
        element={
          <ProtectedRoute>
            <Branding />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/history" 
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="*" 
        element={<Navigate to="/" replace />} 
      />
    </Routes>
  );
}

export default App;


