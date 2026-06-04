import React from 'react'
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiPercent } from 'react-icons/fi'

export default function SummaryCards({ summary, loading }) {
  const totalIncome = summary?.totalIncome || 0;
  const totalExpense = summary?.totalExpense || 0;
  const balance = summary?.balance || 0;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  const cards = [
    {
      title: 'Net Balance',
      value: `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <FiDollarSign size={20} />,
      colorClass: balance >= 0 ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-600 bg-rose-500/10 border-rose-500/20',
      subtitle: balance >= 0 ? 'Healthy surplus' : 'In the deficit',
    },
    {
      title: 'Total Income',
      value: `$${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <FiTrendingUp size={20} />,
      colorClass: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
      subtitle: 'Total incoming earnings',
    },
    {
      title: 'Total Expenses',
      value: `$${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <FiTrendingDown size={20} />,
      colorClass: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
      subtitle: 'Total outgoing cashflow',
    },
    {
      title: 'Savings Rate',
      value: `${Math.max(0, savingsRate).toFixed(1)}%`,
      icon: <FiPercent size={20} />,
      colorClass: savingsRate >= 20 ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-600 bg-amber-500/10 border-amber-500/20',
      subtitle: savingsRate >= 20 ? 'Above 50/30/20 rule target' : 'Try setting budgets',
    },
  ];

  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-2xl glass-panel border border-slate-200/80 animate-pulse">
            <div className="flex justify-between items-center mb-4">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="h-7 bg-slate-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => (
        <div key={idx} className="p-6 rounded-2xl glass-panel border border-slate-200/80 shadow-md glass-card-hover flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-slate-500">{card.title}</span>
            <div className={`p-2 rounded-xl border ${card.colorClass}`}>
              {card.icon}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">{card.value}</h3>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              {card.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
