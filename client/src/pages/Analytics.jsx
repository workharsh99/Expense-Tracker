import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { FiActivity, FiArrowUpRight, FiTrendingUp, FiShoppingBag, FiInfo } from 'react-icons/fi'

const COLORS = ['#0353a4', '#38bdf8', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 border border-slate-200 rounded-xl shadow-xl text-xs">
        <p className="font-bold text-slate-800 mb-1">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} style={{ color: item.color || item.fill }} className="font-semibold">
            {item.name}: ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/transactions/analytics/summary')
      .then(res => {
        setSummary(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>)}
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl mt-6"></div>
      </div>
    );
  }

  const byCategory = summary?.byCategory || {};
  const monthlyStats = summary?.monthlyStats || [];

  const pieData = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const totalExpense = summary?.totalExpense || 0;
  const totalIncome = summary?.totalIncome || 0;

  const avgExpense = monthlyStats.length > 0 ? totalExpense / monthlyStats.length : 0;
  const topCategory = pieData.length > 0 ? pieData[0] : { name: 'None', value: 0 };
  const savingsBuffer = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  let runningSavingsTotal = 0;
  const cumulativeSavingsData = monthlyStats.map(stat => {
    runningSavingsTotal += stat.savings;
    return {
      month: stat.month,
      'Net Worth': runningSavingsTotal,
      'Monthly Savings': stat.savings
    };
  });

  const hasData = pieData.length > 0 || monthlyStats.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-6 pb-12">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Financial Insights</h1>
          <p className="text-slate-500 text-sm mt-1">Deep-dive category analysis and long-term net growth curves</p>
        </div>
        <div className="glass-panel p-12 rounded-2xl border border-slate-200/80 shadow-lg text-center flex flex-col items-center justify-center min-h-[350px]">
          <div className="p-4 bg-slate-100 rounded-full text-slate-500 mb-4">
            <FiActivity size={32} />
          </div>
          <h4 className="text-lg font-bold text-slate-800">No Analytics Data Found</h4>
          <p className="text-slate-550 text-sm max-w-sm mt-1 mb-6">
            Please navigate to dashboard or settings to seed historical transaction data. Once seeded, comprehensive wealth growth curves will render here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Financial Insights</h1>
        <p className="text-slate-555 text-sm mt-1">Deep-dive category analysis and long-term net growth curves</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Average Monthly Spend</span>
            <h3 className="text-2xl font-extrabold text-slate-900">
              ${avgExpense.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
            <p className="text-[10px] text-slate-400">Based on past {monthlyStats.length} active months</p>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-xl">
            <FiArrowUpRight size={22} />
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Primary Spending Source</span>
            <h3 className="text-2xl font-extrabold text-slate-900 truncate max-w-[180px]">{topCategory.name}</h3>
            <p className="text-[10px] text-slate-400">
              Spent: ${topCategory.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-650 rounded-xl">
            <FiShoppingBag size={22} />
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-slate-200/80 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Net Savings Buffer</span>
            <h3 className="text-2xl font-extrabold text-slate-900">{Math.max(0, savingsBuffer).toFixed(1)}%</h3>
            <p className="text-[10px] text-slate-400">Ratio of total incoming cash saved</p>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-650 rounded-xl">
            <FiTrendingUp size={22} />
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 shadow-lg">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <FiActivity size={18} className="text-emerald-500" /> Cumulative Net Worth Progression
        </h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cumulativeSavingsData}>
              <defs>
                <linearGradient id="netWorthGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0353a4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0353a4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Net Worth" stroke="#0353a4" strokeWidth={2.5} fillOpacity={1} fill="url(#netWorthGlow)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 shadow-lg lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Category Spending Breakdown</h3>
          <div className="space-y-4">
            {pieData.map((item, idx) => {
              const pct = totalExpense > 0 ? (item.value / totalExpense) * 100 : 0;
              const color = COLORS[idx % COLORS.length];

              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-700 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                      {item.name}
                    </span>
                    <span className="text-slate-500 font-medium">
                      ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })} 
                      <span className="text-slate-400 font-normal ml-2">({pct.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 border border-slate-250 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FiInfo className="text-amber-500" size={18} /> Financial Health
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Based on your savings rate of <span className="font-bold text-emerald-600">{savingsBuffer.toFixed(1)}%</span>:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2.5">
              <p>
                <strong>50/30/20 Rule:</strong> Standard guidelines recommend placing 50% of net income into needs, 30% into wants, and 20% into savings.
              </p>
              <p>
                {savingsBuffer >= 20 ? (
                  <span className="text-emerald-600 font-semibold">✓ You are exceeding the standard 20% savings buffer rule. Excellent budget control.</span>
                ) : (
                  <span className="text-amber-600 font-semibold">⚠ Your savings buffer is below 20%. Try setting stricter monthly budgets to curb discretionary expenditures.</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="pt-6 text-[10px] text-slate-400 text-center italic border-t border-slate-200/60">
            Expense details audit generated automatically.
          </div>
        </div>
      </div>
    </div>
  )
}
