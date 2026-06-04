import React, { useEffect, useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiAlertCircle, FiCheckCircle, FiDollarSign } from 'react-icons/fi'

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    month: new Date().toISOString().slice(0, 7),
    amount: ''
  });

  const fetchData = async () => {
    try {
      const [budgetRes, summaryRes] = await Promise.all([
        api.get('/budget'),
        api.get('/transactions/analytics/summary')
      ]);
      setBudgets(budgetRes.data || []);
      setSummary(summaryRes.data);
    } catch (err) {
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) {
      return toast.error('Please enter a valid amount');
    }

    setSubmitting(true);
    try {
      await api.post('/budget', {
        month: form.month,
        amount: parseFloat(form.amount)
      });
      toast.success(`Budget updated for ${formatMonthLabel(form.month)}`);
      setForm({ ...form, amount: '' });
      fetchData();
    } catch (err) {
      toast.error('Failed to set budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await api.delete(`/budget/${id}`);
      toast.success('Budget deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete budget');
    }
  };

  const formatMonthLabel = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
  };

  const getSpentForMonth = (monthStr) => {
    if (!summary || !summary.monthlyStats) return 0;
    const stat = summary.monthlyStats.find(s => s.rawMonth === monthStr);
    return stat ? stat.expense : 0;
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Monthly Budgets</h1>
        <p className="text-slate-500 text-sm mt-1">Configure spending limits per month and check your limit status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 shadow-md h-fit">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FiPlus className="text-emerald-500" /> Set Monthly Budget
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Select Month</label>
              <input
                type="month"
                required
                className="w-full px-3 py-2 rounded-xl glass-input text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                value={form.month}
                onChange={e => setForm({ ...form, month: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Limit Amount</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full pl-8 pr-3 py-2 rounded-xl glass-input text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg hover:shadow-emerald-500/10 transition-all active:scale-[0.98]"
            >
              {submitting ? 'Saving...' : 'Set Budget Limit'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="p-6 rounded-2xl glass-panel border border-slate-200/80 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-24 mb-4"></div>
                  <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
                  <div className="h-2 bg-slate-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : budgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map(b => {
                const spent = getSpentForMonth(b.month);
                const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
                
                let barColor = 'bg-emerald-500';
                let textColor = 'text-emerald-650';
                let cardBorder = 'border-slate-200/80';
                let statusIcon = <FiCheckCircle className="text-emerald-600" size={16} />;
                let statusLabel = 'Under budget';

                if (pct >= 100) {
                  barColor = 'bg-rose-500';
                  textColor = 'text-rose-600';
                  cardBorder = 'border-rose-300 bg-rose-50/20';
                  statusIcon = <FiAlertCircle className="text-rose-600" size={16} />;
                  statusLabel = 'Over budget limit!';
                } else if (pct >= 80) {
                  barColor = 'bg-amber-500';
                  textColor = 'text-amber-600';
                  cardBorder = 'border-amber-300';
                  statusIcon = <FiAlertCircle className="text-amber-600" size={16} />;
                  statusLabel = 'Warning: limit close';
                }

                return (
                  <div key={b._id} className={`p-6 rounded-2xl glass-panel border ${cardBorder} shadow-sm flex flex-col justify-between`}>
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                            {formatMonthLabel(b.month)}
                          </h4>
                          <span className={`text-2xl font-extrabold text-slate-800 mt-1 block`}>
                            ${b.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(b._id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Limit"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>

                      <div className="flex justify-between items-center text-xs mt-4 mb-2">
                        <span className="text-slate-500 font-medium">Spent: ${spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        <span className={`font-bold ${textColor}`}>{pct.toFixed(0)}%</span>
                      </div>

                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-200/50 flex items-center gap-1.5 text-xs">
                      {statusIcon}
                      <span className={`font-semibold ${textColor}`}>{statusLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl border border-slate-200/80 shadow-md text-center flex flex-col items-center justify-center min-h-[300px] bg-slate-50/30">
              <div className="p-4 bg-slate-100 rounded-full text-slate-500 mb-4">
                <FiDollarSign size={32} />
              </div>
              <h4 className="text-lg font-bold text-slate-800">No Monthly Budgets Configured</h4>
              <p className="text-slate-500 text-sm max-w-sm mt-1 mb-6">
                Creating monthly spending budgets will allow you to monitor your expenditures against fixed limits dynamically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
