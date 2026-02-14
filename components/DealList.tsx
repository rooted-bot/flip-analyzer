import { useState, useEffect } from 'react';
import { Deal, DealAnalysis, DealStatus } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/analysis';
import { getGradeColor } from '@/lib/utils';

interface DealListProps {
  deals: Deal[];
  analyses: Record<string, DealAnalysis>;
  onSelectDeal: (deal: Deal) => void;
  onUpdateStatus: (dealId: string, status: DealStatus) => void;
  selectedDealId?: string;
}

const statusColors: Record<DealStatus, string> = {
  'lead': 'bg-gray-100 text-gray-800',
  'analyzed': 'bg-blue-100 text-blue-800',
  'offered': 'bg-yellow-100 text-yellow-800',
  'under-contract': 'bg-orange-100 text-orange-800',
  'closed': 'bg-green-100 text-green-800',
  'dead': 'bg-red-100 text-red-800',
};

const statusLabels: Record<DealStatus, string> = {
  'lead': 'Lead',
  'analyzed': 'Analyzed',
  'offered': 'Offered',
  'under-contract': 'Under Contract',
  'closed': 'Closed',
  'dead': 'Dead',
};

export default function DealList({ 
  deals, 
  analyses, 
  onSelectDeal, 
  onUpdateStatus,
  selectedDealId 
}: DealListProps) {
  const [filter, setFilter] = useState<DealStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'profit' | 'grade'>('date');

  const filteredDeals = deals.filter(deal => 
    filter === 'all' ? true : deal.status === filter
  );

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'profit') {
      const profitA = analyses[a.id!]?.projectedProfit || 0;
      const profitB = analyses[b.id!]?.projectedProfit || 0;
      return profitB - profitA;
    }
    if (sortBy === 'grade') {
      const gradeOrder = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
      const gradeA = analyses[a.id!]?.grade || 'D';
      const gradeB = analyses[b.id!]?.grade || 'D';
      return gradeOrder[gradeB] - gradeOrder[gradeA];
    }
    return 0;
  });

  const stats = {
    total: deals.length,
    active: deals.filter(d => ['lead', 'analyzed', 'offered', 'under-contract'].includes(d.status)).length,
    closed: deals.filter(d => d.status === 'closed').length,
    totalProfit: deals.reduce((sum, deal) => sum + (analyses[deal.id!]?.projectedProfit || 0), 0),
    avgGrade: deals.length > 0 
      ? (deals.reduce((sum, deal) => {
          const grade = analyses[deal.id!]?.grade;
          return sum + (grade === 'A' ? 4 : grade === 'B' ? 3 : grade === 'C' ? 2 : 1);
        }, 0) / deals.length).toFixed(1)
      : '0',
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-xs text-gray-500">Total Deals</p>
          <p className="text-xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-xl font-bold text-blue-600">{stats.active}</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-xs text-gray-500">Closed</p>
          <p className="text-xl font-bold text-green-600">{stats.closed}</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-xs text-gray-500">Total Profit</p>
          <p className="text-xl font-bold text-primary-600">{formatCurrency(stats.totalProfit)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as DealStatus | 'all')}
          className="text-sm border rounded px-3 py-1.5"
        >
          <option value="all">All Status</option>
          <option value="lead">Lead</option>
          <option value="analyzed">Analyzed</option>
          <option value="offered">Offered</option>
          <option value="under-contract">Under Contract</option>
          <option value="closed">Closed</option>
          <option value="dead">Dead</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'profit' | 'grade')}
          className="text-sm border rounded px-3 py-1.5"
        >
          <option value="date">Sort by Date</option>
          <option value="profit">Sort by Profit</option>
          <option value="grade">Sort by Grade</option>
        </select>

        <span className="text-sm text-gray-500 ml-auto">
          Showing {sortedDeals.length} deals
        </span>
      </div>

      {/* Deal Cards */}
      <div className="space-y-3">
        {sortedDeals.map((deal) => {
          const analysis = analyses[deal.id!];
          return (
            <div
              key={deal.id}
              onClick={() => onSelectDeal(deal)}
              className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer transition hover:shadow-md ${
                selectedDealId === deal.id ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {deal.address}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {deal.bedrooms}bd • {deal.bathrooms}ba • {deal.squareFeet?.toLocaleString()} sqft
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {analysis && (
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(analysis.grade)}`}>
                      {analysis.grade}
                    </span>
                  )}
                  <select
                    value={deal.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(deal.id!, e.target.value as DealStatus);
                    }}
                    className={`text-xs border rounded px-2 py-1 ${statusColors[deal.status]}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t">
                <div>
                  <p className="text-xs text-gray-500">List Price</p>
                  <p className="font-medium">{formatCurrency(deal.listPrice)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">ARV</p>
                  <p className="font-medium">{formatCurrency(deal.estimatedArv)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Profit</p>
                  <p className={`font-medium ${analysis && analysis.projectedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis ? formatCurrency(analysis.projectedProfit) : '-'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>CoC: {analysis ? formatPercent(analysis.cashOnCashRoi) : '-'}</span>
                <span>•</span>
                <span>70% Rule: {analysis ? formatCurrency(analysis.maxOffer70Percent) : '-'}</span>
                {deal.daysOnMarket && (
                  <>
                    <span>•</span>
                    <span>DOM: {deal.daysOnMarket}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {sortedDeals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No deals found.</p>
            <p className="text-sm mt-1">Add your first deal to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}