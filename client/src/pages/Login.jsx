import React, { useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import { FiMail, FiLock } from 'react-icons/fi'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return toast.error('Please fill in all fields');
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      await login(res.data.token);
      toast.success('Welcome back!');
      nav('/');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-4 overflow-hidden">
      <div className="bg-glow-purple -top-10 -left-10"></div>
      <div className="bg-glow-blue -bottom-10 -right-10"></div>

      <div className="relative w-full max-w-md p-8 rounded-2xl glass-panel shadow-2xl border border-slate-200/80 z-10">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-slate-500 mt-2 text-sm">Sign in to manage your financial portfolio</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <FiMail size={18} />
              </span>
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
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
              'Sign In'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          New here?{' '}
          <Link to="/register" className="text-emerald-600 hover:text-emerald-500 font-semibold transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
