import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiUser, FiLock, FiDatabase, FiSettings, FiActivity } from 'react-icons/fi'

export default function Profile() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [stats, setStats] = useState({ transactionsCount: 0, budgetsCount: 0 });
  
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, email: user.email });
      Promise.all([
        api.get('/transactions'),
        api.get('/budget')
      ])
        .then(([txRes, budgetRes]) => {
          setStats({
            transactionsCount: txRes.data.total || 0,
            budgetsCount: budgetRes.data?.length || 0
          });
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.email) {
      return toast.error('Name and email are required');
    }
    setLoading(true);
    try {
      await api.put('/auth/me', profileForm);
      toast.success('Profile details updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error('All password fields are required');
    }
    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters long');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to change password. Make sure current password is correct.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await api.post('/transactions/seed');
      toast.success('Demo data seeded successfully!');
      const [txRes, budgetRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/budget')
      ]);
      setStats({
        transactionsCount: txRes.data.total || 0,
        budgetsCount: budgetRes.data?.length || 0
      });
    } catch (err) {
      toast.error('Failed to seed demo data');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your credentials, details, and demo configs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 shadow-md h-fit space-y-1.5">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'profile' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <FiUser size={16} /> Profile Details
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'security' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <FiLock size={16} /> Security
          </button>
          <button
            onClick={() => setActiveTab('developer')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'developer' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' : 'text-slate-505 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <FiDatabase size={16} /> Developer Seeder
          </button>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 shadow-lg md:col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <FiSettings className="text-emerald-500" size={18} /> Update Profile Info
                </h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl glass-input text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      value={profileForm.name}
                      onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email Address</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 rounded-xl glass-input text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      value={profileForm.email}
                      onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold transition-all active:scale-[0.98]"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 shadow-lg space-y-5">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FiActivity className="text-emerald-500" size={18} /> Expense Stats
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Logged Transactions</span>
                    <span className="text-2xl font-extrabold text-slate-800 block mt-0.5">{stats.transactionsCount}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Active Budgets</span>
                    <span className="text-2xl font-extrabold text-slate-800 block mt-0.5">{stats.budgetsCount}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-505 text-slate-500 font-medium">Member Since</span>
                    <span className="text-sm font-semibold text-slate-700 block mt-1">
                      {user ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 shadow-lg max-w-2xl space-y-4">
              <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <FiLock className="text-emerald-500" size={18} /> Change Password
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 rounded-xl glass-input text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="••••••••"
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 rounded-xl glass-input text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Min 6 characters"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 rounded-xl glass-input text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="••••••••"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold transition-all active:scale-[0.98]"
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'developer' && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 shadow-lg max-w-2xl space-y-4">
              <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <FiDatabase className="text-emerald-500" size={18} /> Demo Database Configuration
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Clicking the button below will instantly clear any existing transactions/budgets and seed 6 months of highly realistic demo entries under your account. Use this to quickly demonstrate charts, lists, and filtering functionality.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleSeedData}
                  disabled={seeding}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-[0.98]"
                >
                  {seeding ? 'Generating mock ledger...' : 'Reseed Demo Data'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
