import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { MarketAnalysis, NextRolePrediction } from '../types';

interface SalaryChartProps {
  currentTotal: number;
  marketAnalysis: MarketAnalysis;
  nextRole: NextRolePrediction;
  currencyCode: string;
  currencySymbol: string;
}

const SalaryChart: React.FC<SalaryChartProps> = ({ currentTotal, marketAnalysis, nextRole, currencyCode, currencySymbol }) => {
  
  // For Newbies: currentTotal = Expected Salary (can be 0)
  // For Pros: currentTotal = Actual Salary
  
  // Check if this is likely a newbie scenario where we want to show specific labels
  const isEntryLevel = marketAnalysis.paymentStatus === 'Entry Level';

  const data = [
    {
      name: isEntryLevel ? 'Your Expectation' : 'You',
      amount: currentTotal,
      fill: isEntryLevel ? '#f97316' : '#3b82f6', // Orange for Newbie, Blue for Pro
    },
    {
      name: isEntryLevel ? 'Market Start' : 'Market Median',
      amount: marketAnalysis.currentRoleMarketValue.median,
      fill: '#64748b', // Slate-500
    },
    {
      name: isEntryLevel ? 'Future (2yrs)' : 'Next Role',
      amount: nextRole.salaryRange.median,
      fill: '#10b981', // Emerald-500
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumSignificantDigits: 3
    }).format(value);
  };

  return (
    <div className="w-full h-[400px] bg-white rounded-xl shadow-sm border border-slate-100 p-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Compensation Trajectory</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 14, fontWeight: 500 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tickFormatter={(value) => `${currencySymbol} ${(value / 1000)}k`}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [formatCurrency(value), 'Annual Comp']}
          />
          <ReferenceLine y={marketAnalysis.currentRoleMarketValue.max} label="Market Max" stroke="#ef4444" strokeDasharray="3 3" />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={60}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalaryChart;