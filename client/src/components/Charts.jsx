import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts'
import { FiPieChart, FiBarChart2, FiActivity } from 'react-icons/fi'

const COLORS = ['#10b981', '#34d399', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 border border-slate-200 rounded-xl shadow-xl text-xs space-y-1">
        {label && <p className="font-bold text-slate-800 mb-1">{label}</p>}
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

export default function Charts({ summary }) {
  const pieData = summary && summary.byCategory 
    ? Object.entries(summary.byCategory).map(([k, v]) => ({ name: k, value: v })) 
    : [];
  
  const monthlyData = summary?.monthlyStats || [];

  const hasData = pieData.length > 0 || monthlyData.length > 0;

  if (!hasData) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center min-h-[300px] text-center bg-slate-50/30">
        <div className="p-4 bg-slate-100 rounded-full text-slate-500 mb-3">
          <FiActivity size={32} />
        </div>
        <h4 className="text-lg font-bold text-slate-800">No Chart Data Available</h4>
        <p className="text-slate-500 text-sm max-w-sm mt-1">Seeding realistic mock data from the settings page will populate these interactive analytics immediately.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 shadow-md flex flex-col justify-between min-h-[320px]">
        <div className="flex items-center gap-2 mb-4">
          <FiPieChart className="text-emerald-500" size={18} />
          <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">Expenses by Category</h3>
        </div>
        {pieData.length > 0 ? (
          <div className="h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  dataKey="value" 
                  nameKey="name" 
                  innerRadius={60}
                  outerRadius={80} 
                  paddingAngle={3}
                  fill="#8884d8"
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Spent</span>
              <span className="text-lg font-extrabold text-slate-800">
                ${summary?.totalExpense?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">No expenses logged yet</div>
        )}
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 shadow-md flex flex-col justify-between min-h-[320px] lg:col-span-1">
        <div className="flex items-center gap-2 mb-4">
          <FiBarChart2 className="text-emerald-500" size={18} />
          <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">Monthly Expenses</h3>
        </div>
        {monthlyData.length > 0 ? (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16,185,129,0.03)' }} />
                <Bar dataKey="expense" fill="#ff7f7f" radius={[4, 4, 0, 0]} name="Expense">
                  {monthlyData.map((entry, idx) => (
                    <Cell key={idx} fill="url(#barGradient)" />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">No monthly trends yet</div>
        )}
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 shadow-md flex flex-col justify-between min-h-[320px] lg:col-span-1">
        <div className="flex items-center gap-2 mb-4">
          <FiActivity className="text-emerald-500" size={18} />
          <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">Cash Flow Trends</h3>
        </div>
        {monthlyData.length > 0 ? (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">No analytics available</div>
        )}
      </div>
    </div>
  )
}
