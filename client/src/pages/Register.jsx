import React, { useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import { FiUser, FiMail, FiLock } from 'react-icons/fi'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      return toast.error('Please fill in all fields');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }
    if (form.password !== form.confirm) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name: form.name, email: form.email, password: form.password });
      await login(res.data.token);
      toast.success('Account created successfully!');
      nav('/');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 overflow-hidden py-10">
      <div className="bg-glow-purple -top-10 -right-10"></div>
      <div className="bg-glow-blue -bottom-10 -left-10"></div>

      <div className="relative w-full max-w-md p-8 rounded-2xl glass-panel shadow-2xl border border-slate-200/80 z-10">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-slate-500 mt-2 text-sm">Join us and start tracking your wealth today</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <FiUser size={18} />
              </span>
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <FiMail size={18} />
              </span>
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <FiLock size={18} />
              </span>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <FiLock size={18} />
              </span>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="••••••••"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] transition-all duration-200 mt-6 flex justify-center items-center"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Get Started'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 hover:text-emerald-500 font-semibold transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
