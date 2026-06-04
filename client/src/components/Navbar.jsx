import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiPieChart, FiDollarSign, FiUser, FiLogOut, FiMenu, FiX, FiTrendingUp } from 'react-icons/fi'

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    nav('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `
    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
    ${isActive(path) 
      ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/20 shadow-sm' 
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
    }
  `;

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/80 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
          <FiTrendingUp className="text-emerald-500" size={24} />
          <span>Expense Tracker</span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link to="/" className={linkClass('/')}>
                <FiPieChart size={16} /> Dashboard
              </Link>
              <Link to="/transactions" className={linkClass('/transactions')}>
                <FiDollarSign size={16} /> Transactions
              </Link>
              <Link to="/budget" className={linkClass('/budget')}>
                <FiTrendingUp size={16} /> Budget
              </Link>
              <Link to="/analytics" className={linkClass('/analytics')}>
                <FiPieChart size={16} /> Analytics
              </Link>
              
              <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
              
              <Link to="/profile" className={linkClass('/profile')}>
                <FiUser size={16} /> Profile
              </Link>

              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 ml-2 px-4 py-2 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50/50 border border-transparent hover:border-rose-500/10 transition-all duration-200"
              >
                <FiLogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-slate-600 hover:text-slate-900 px-4 py-2 text-sm font-semibold transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:shadow-emerald-500/10 transition-all">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <div className="md:hidden">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-slate-600 hover:text-slate-900">
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-200/80 space-y-2 flex flex-col">
          {user ? (
            <>
              <Link to="/" className={linkClass('/')} onClick={() => setMobileOpen(false)}>
                <FiPieChart size={16} /> Dashboard
              </Link>
              <Link to="/transactions" className={linkClass('/transactions')} onClick={() => setMobileOpen(false)}>
                <FiDollarSign size={16} /> Transactions
              </Link>
              <Link to="/budget" className={linkClass('/budget')} onClick={() => setMobileOpen(false)}>
                <FiTrendingUp size={16} /> Budget
              </Link>
              <Link to="/analytics" className={linkClass('/analytics')} onClick={() => setMobileOpen(false)}>
                <FiPieChart size={16} /> Analytics
              </Link>
              <Link to="/profile" className={linkClass('/profile')} onClick={() => setMobileOpen(false)}>
                <FiUser size={16} /> Profile
              </Link>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 w-full text-left px-4 py-2 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50/50"
              >
                <FiLogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <div className="pt-2 space-y-2">
              <Link to="/login" className="block text-center text-slate-600 hover:text-slate-900 px-4 py-2 text-sm font-semibold" onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="block text-center bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold" onClick={() => setMobileOpen(false)}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
