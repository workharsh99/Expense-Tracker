import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Analytics from './pages/Analytics'
import Budget from './pages/Budget'
import Profile from './pages/Profile'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'

function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/transactions" element={<Protected><Transactions /></Protected>} />
          <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
          <Route path="/budget" element={<Protected><Budget /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
