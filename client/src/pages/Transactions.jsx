import React, { useEffect, useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { FiSearch, FiPlus, FiChevronLeft, FiChevronRight, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'

export default function Transactions() {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sort, setSort] = useState('date_desc');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: 'Food',
    source: 'Salary',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Food', 'Housing', 'Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Health', 'Other'];
  const sources = ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'];

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = `/transactions?page=${page}&limit=${limit}&sort=${sort}`;
      if (search) url += `&q=${encodeURIComponent(search)}`;
      if (category) url += `&category=${category}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const res = await api.get(url);
      setTxs(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, category, startDate, endDate, sort]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchTransactions();
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const handleOpenAddModal = () => {
    setEditingTx(null);
    setForm({
      type: 'expense',
      amount: '',
      category: 'Food',
      source: 'Salary',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (tx) => {
    setEditingTx(tx);
    setForm({
      type: tx.type,
      amount: tx.amount,
      category: tx.category || 'Food',
      source: tx.source || 'Salary',
      notes: tx.notes || '',
      date: new Date(tx.date).toISOString().split('T')[0]
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) {
      return toast.error('Please enter a valid amount');
    }

    try {
      const payload = {
        type: form.type,
        amount: parseFloat(form.amount),
        date: form.date,
        notes: form.notes || undefined,
        category: form.type === 'expense' ? form.category : undefined,
        source: form.type === 'income' ? form.source : undefined
      };

      if (editingTx) {
        await api.put(`/transactions/${editingTx._id}`, payload);
        toast.success('Transaction updated');
      } else {
        await api.post('/transactions', payload);
        toast.success('Transaction created');
      }
      setModalOpen(false);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction permanently?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch (err) {
      toast.error('Failed to delete transaction');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setSort('date_desc');
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Expense Transactions</h1>
          <p className="text-slate-500 text-sm mt-1">Audit, edit, and filter your financial cashflow history</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg hover:shadow-emerald-500/10 active:scale-95 transition-all"
        >
          <FiPlus size={16} /> Add Transaction
        </button>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <FiSearch size={16} />
            </span>
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Search by note or source..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="px-3 py-2 rounded-xl glass-input text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(1); }}
          >
            <option value="" className="bg-white text-slate-800">All Categories</option>
            {categories.map(c => <option key={c} value={c} className="bg-white text-slate-800">{c}</option>)}
          </select>

          <select
            className="px-3 py-2 rounded-xl glass-input text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            value={sort}
            onChange={e => { setSort(e.target.value); setPage(1); }}
          >
            <option value="date_desc" className="bg-white text-slate-800">Newest First</option>
            <option value="date_asc" className="bg-white text-slate-800">Oldest First</option>
            <option value="amount_desc" className="bg-white text-slate-800">Amount: High to Low</option>
            <option value="amount_asc" className="bg-white text-slate-800">Amount: Low to High</option>
          </select>

          <button
            onClick={resetFilters}
            className="px-4 py-2 border border-slate-300 hover:border-slate-400 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold transition-all"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 uppercase font-semibold">From:</span>
            <input
              type="date"
              className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 uppercase font-semibold">To:</span>
            <input
              type="date"
              className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Category/Source</th>
                <th className="py-4 px-6">Description / Notes</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 text-sm">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6"><div className="w-12 h-6 bg-slate-200 rounded"></div></td>
                    <td className="py-4 px-6"><div className="w-20 h-4 bg-slate-200 rounded"></div></td>
                    <td className="py-4 px-6"><div className="w-24 h-4 bg-slate-200 rounded"></div></td>
                    <td className="py-4 px-6"><div className="w-32 h-4 bg-slate-200 rounded"></div></td>
                    <td className="py-4 px-6"><div className="w-16 h-4 bg-slate-200 rounded ml-auto"></div></td>
                    <td className="py-4 px-6"><div className="w-16 h-6 bg-slate-200 rounded mx-auto"></div></td>
                  </tr>
                ))
              ) : txs.length > 0 ? (
                txs.map(t => (
                  <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        t.type === 'income' ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/20' : 'bg-rose-50 text-rose-600 border border-rose-500/20'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {new Date(t.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {t.category || t.source || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-slate-500 italic">
                      {t.notes || '—'}
                    </td>
                    <td className={`py-4 px-6 text-right font-bold ${
                      t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(t)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 text-sm">
                    No transactions match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            Showing Page <span className="font-semibold text-slate-800">{page}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span> ({total} items total)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-slate-300 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <FiChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold text-slate-600 px-3">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-slate-300 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative w-full max-w-md p-6 rounded-2xl glass-panel border border-slate-200 shadow-2xl z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {editingTx ? 'Edit Transaction' : 'Add Transaction'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-800 p-1">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'expense' })}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    form.type === 'expense' ? 'bg-rose-50 text-rose-600 border border-rose-500/20 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'income' })}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    form.type === 'income' ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/20 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Income
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Amount</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-450">$</span>
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

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 rounded-xl glass-input text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  {form.type === 'expense' ? 'Category' : 'Source'}
                </label>
                <select
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  value={form.type === 'expense' ? form.category : form.source}
                  onChange={e =>
                    setForm({
                      ...form,
                      [form.type === 'expense' ? 'category' : 'source']: e.target.value
                    })
                  }
                >
                  {form.type === 'expense'
                    ? categories.map(c => <option key={c} value={c} className="bg-white text-slate-800">{c}</option>)
                    : sources.map(s => <option key={s} value={s} className="bg-white text-slate-800">{s}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Notes</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Details about transaction..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg transition-all active:scale-[0.98]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
