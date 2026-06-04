import React, { useEffect, useState } from 'react'
import api from '../services/api'
import SummaryCards from '../components/SummaryCards'
import Charts from '../components/Charts'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiActivity, FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recents, setRecents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [quickForm, setQuickForm] = useState({
    type: 'expense',
    amount: '',
    category: 'Food',
    source: 'Salary',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      const [sumRes, txRes] = await Promise.all([
        api.get('/transactions/analytics/summary'),
        api.get('/transactions?limit=5')
      ]);
      setSummary(sumRes.data);
      setRecents(txRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickForm.amount || isNaN(quickForm.amount) || parseFloat(quickForm.amount) <= 0) {
      return toast.error('Please enter a valid amount');
    }

    setSubmitting(true);
    try {
      const payload = {
        type: quickForm.type,
        amount: parseFloat(quickForm.amount),
        date: quickForm.date,
        notes: quickForm.notes || undefined,
        category: quickForm.type === 'expense' ? quickForm.category : undefined,
        source: quickForm.type === 'income' ? quickForm.source : undefined
      };

      await api.post('/transactions', payload);
      toast.success('Transaction added successfully!');
      
      setQuickForm(prev => ({
        ...prev,
        amount: '',
        notes: ''
      }));

      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || 'Failed to add transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await api.post('/transactions/seed');
      toast.success('Realistic demo data seeded successfully!');
      fetchData();
    } catch (err) {
      toast.error('Failed to seed demo data');
    } finally {
      setSeeding(false);
    }
  };

  const categories = ['Food', 'Housing', 'Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Health', 'Other'];
  const sources = ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'];

  const noData = !summary || (summary.totalIncome === 0 && summary.totalExpense === 0);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time breakdown of your income, spending, and budgets</p>
        </div>
        {noData && (
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg hover:shadow-emerald-500/10 active:scale-95 transition-all"
          >
            {seeding ? 'Generating Data...' : 'Seed Realistic Demo Data'}
          </button>
        )}
      </div>

      <SummaryCards summary={summary} loading={loading} />

      {noData && !loading && (
        <div className="p-6 rounded-2xl glass-panel border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-emerald-500/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-emerald-600">Empty Database Detected</h4>
            <p className="text-sm text-slate-600 max-w-2xl">
              To evaluate the project quickly, click the demo seeder. This will insert 6 months of historical transactions (rent, utilities, salaries, dining, movie tickets) and monthly budgets, populating the charts instantly.
            </p>
          </div>
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-md active:scale-95 flex-shrink-0"
          >
            {seeding ? 'Seeding...' : 'Populate Demo Data'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 shadow-md">
            <Charts summary={summary} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 shadow-md">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FiPlus size={20} className="text-emerald-500" /> Quick Add Transaction
            </h3>
            <form onSubmit={handleQuickAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 bg-slate-100/85 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setQuickForm({ ...quickForm, type: 'expense' })}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    quickForm.type === 'expense' ? 'bg-rose-50 text-rose-600 border border-rose-500/20 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setQuickForm({ ...quickForm, type: 'income' })}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    quickForm.type === 'income' ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/20 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Income
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full pl-8 pr-3 py-2 rounded-xl glass-input text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="0.00"
                      value={quickForm.amount}
                      onChange={e => setQuickForm({ ...quickForm, amount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 rounded-xl glass-input text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                    value={quickForm.date}
                    onChange={e => setQuickForm({ ...quickForm, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {quickForm.type === 'expense' ? 'Category' : 'Source'}
                </label>
                <select
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  value={quickForm.type === 'expense' ? quickForm.category : quickForm.source}
                  onChange={e =>
                    setQuickForm({
                      ...quickForm,
                      [quickForm.type === 'expense' ? 'category' : 'source']: e.target.value
                    })
                  }
                >
                  {quickForm.type === 'expense'
                    ? categories.map(c => <option key={c} value={c} className="bg-white text-slate-800">{c}</option>)
                    : sources.map(s => <option key={s} value={s} className="bg-white text-slate-800">{s}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Notes (Optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Dinner, petrol, utility bill..."
                  value={quickForm.notes}
                  onChange={e => setQuickForm({ ...quickForm, notes: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all active:scale-[0.98]"
              >
                {submitting ? 'Adding...' : 'Add Transaction'}
              </button>
            </form>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Recent Entries</h3>
              <Link to="/transactions" className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 flex items-center gap-1 transition-colors">
                View All <FiArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between items-center py-2 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                      <div>
                        <div className="h-3.5 bg-slate-200 rounded w-20 mb-1.5"></div>
                        <div className="h-2.5 bg-slate-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-12"></div>
                  </div>
                ))}
              </div>
            ) : recents.length > 0 ? (
              <div className="space-y-3 divide-y divide-slate-200/40">
                {recents.map((tx, idx) => (
                  <div key={tx._id} className={`flex justify-between items-center py-2.5 ${idx !== 0 ? 'border-t border-slate-200/30' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          tx.type === 'income' ? 'text-emerald-600 bg-emerald-50 border border-emerald-500/20' : 'text-rose-600 bg-rose-50 border border-rose-500/20'
                        }`}
                      >
                        {tx.type === 'income' ? 'IN' : 'EX'}
                      </div>
                      <div className="max-w-[120px] sm:max-w-none">
                        <p className="text-sm font-semibold text-slate-800 truncate">{tx.notes || tx.category || tx.source}</p>
                        <p className="text-[10px] text-slate-500">{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() => handleDelete(tx._id)}
                        className="text-slate-500 hover:text-rose-500 p-1.5 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center justify-center">
                <FiActivity size={24} className="mb-2 text-slate-400" />
                No transactions recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
