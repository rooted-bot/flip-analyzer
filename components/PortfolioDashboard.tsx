import { useState, useMemo } from 'react';
import { FlipProject, RentalProperty, FlipStatus, RentalStatus } from '@/types';
import { formatCurrency, formatDate, daysBetween } from '@/lib/utils';

interface PortfolioDashboardProps {
  flips: FlipProject[];
  rentals: RentalProperty[];
}

const flipStatusColors: Record<FlipStatus, string> = {
  'acquisition': 'bg-purple-100 text-purple-800',
  'rehab': 'bg-yellow-100 text-yellow-800',
  'marketing': 'bg-blue-100 text-blue-800',
  'under_contract': 'bg-orange-100 text-orange-800',
  'closing': 'bg-green-100 text-green-800',
  'completed': 'bg-green-500 text-white',
  'cancelled': 'bg-red-100 text-red-800',
};

const rentalStatusColors: Record<RentalStatus, string> = {
  'vacant': 'bg-red-100 text-red-800',
  'occupied': 'bg-green-100 text-green-800',
  'under_rehab': 'bg-yellow-100 text-yellow-800',
  'for_sale': 'bg-blue-100 text-blue-800',
  'sold': 'bg-gray-100 text-gray-800',
};

export default function PortfolioDashboard({ flips, rentals }: PortfolioDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'flips' | 'rentals'>('overview');

  // Calculate portfolio stats
  const stats = useMemo(() => {
    const activeFlips = flips.filter(f => !['completed', 'cancelled'].includes(f.status));
    const completedFlips = flips.filter(f => f.status === 'completed');
    
    const totalFlipProfit = completedFlips.reduce((sum, f) => {
      const salePrice = f.sale_price || 0;
      const totalCost = f.purchase_price + (f.rehab_actual || f.rehab_budget) + calculateHoldingCosts(f);
      return sum + (salePrice - totalCost);
    }, 0);

    const avgFlipTimeline = completedFlips.length > 0
      ? completedFlips.reduce((sum, f) => {
          const days = daysBetween(f.purchase_date, f.sale_date || new Date().toISOString());
          return sum + days;
        }, 0) / completedFlips.length
      : 0;

    const totalMonthlyRent = rentals.reduce((sum, r) => sum + r.monthly_rent, 0);
    const totalMonthlyExpenses = rentals.reduce((sum, r) => sum + r.monthly_expenses, 0);
    const totalMonthlyCashflow = totalMonthlyRent - totalMonthlyExpenses;

    const portfolioValue = rentals.reduce((sum, r) => sum + r.current_value, 0);
    const totalInvestment = rentals.reduce((sum, r) => sum + r.purchase_price + r.rehab_cost, 0);
    const totalEquity = portfolioValue - totalInvestment;

    return {
      activeFlips: activeFlips.length,
      completedFlips12mo: completedFlips.filter(f => 
        daysBetween(f.sale_date || '', new Date().toISOString()) <= 365
      ).length,
      totalFlipProfit,
      avgFlipProfit: completedFlips.length > 0 ? totalFlipProfit / completedFlips.length : 0,
      avgFlipTimeline,
      totalRentalUnits: rentals.length,
      occupiedUnits: rentals.filter(r => r.status === 'occupied').length,
      totalMonthlyRent,
      totalMonthlyCashflow,
      portfolioValue,
      totalEquity,
    };
  }, [flips, rentals]);

  function calculateHoldingCosts(flip: FlipProject): number {
    const months = Math.ceil(daysBetween(flip.purchase_date, flip.sale_date || new Date().toISOString()) / 30);
    return (flip.holding_costs_monthly || 0) * months;
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(['overview', 'flips', 'rentals'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Active Flips</p>
              <p className="text-2xl font-bold text-purple-600">{stats.activeFlips}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Total Flip Profit</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalFlipProfit)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Monthly Cashflow</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalMonthlyCashflow)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Portfolio Value</p>
              <p className="text-2xl font-bold text-primary-600">{formatCurrency(stats.portfolioValue)}</p>
            </div>
          </div>

          {/* Flip Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-lg mb-4">Flip Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Completed (12mo)</p>
                <p className="text-xl font-medium">{stats.completedFlips12mo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Profit per Flip</p>
                <p className="text-xl font-medium text-green-600">{formatCurrency(stats.avgFlipProfit)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Timeline</p>
                <p className="text-xl font-medium">{Math.round(stats.avgFlipTimeline)} days</p>
              </div>
            </div>
          </div>

          {/* Rental Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-lg mb-4">Rental Portfolio</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Units</p>
                <p className="text-xl font-medium">{stats.totalRentalUnits}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Occupied</p>
                <p className="text-xl font-medium text-green-600">
                  {stats.occupiedUnits} ({stats.totalRentalUnits > 0 ? Math.round((stats.occupiedUnits / stats.totalRentalUnits) * 100) : 0}%)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Equity</p>
                <p className="text-xl font-medium text-primary-600">{formatCurrency(stats.totalEquity)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flips Tab */}
      {activeTab === 'flips' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Active Flip Projects</h3>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700">
              + New Flip
            </button>
          </div>

          {flips.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
              <p>No flip projects yet.</p>
              <p className="text-sm mt-1">Add your first flip project to track it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {flips.map((flip) => (
                <div key={flip.id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{flip.address}</h4>
                      <p className="text-sm text-gray-500">
                        Purchased: {formatDate(flip.purchase_date)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${flipStatusColors[flip.status]}`}>
                      {flip.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-500">Purchase</p>
                      <p className="font-medium">{formatCurrency(flip.purchase_price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Rehab Budget</p>
                      <p className="font-medium">{formatCurrency(flip.rehab_budget)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ARV</p>
                      <p className="font-medium">{formatCurrency(flip.arv)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Potential Profit</p>
                      <p className="font-medium text-green-600">
                        {formatCurrency(flip.arv - flip.purchase_price - flip.rehab_budget)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rentals Tab */}
      {activeTab === 'rentals' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Rental Properties</h3>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700">
              + New Rental
            </button>
          </div>

          {rentals.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
              <p>No rental properties yet.</p>
              <p className="text-sm mt-1">Add your first rental to track it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rentals.map((rental) => (
                <div key={rental.id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{rental.address}</h4>
                      <p className="text-sm text-gray-500">
                        Purchased: {formatDate(rental.purchase_date)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${rentalStatusColors[rental.status]}`}>
                      {rental.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-500">Monthly Rent</p>
                      <p className="font-medium text-green-600">{formatCurrency(rental.monthly_rent)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Monthly Cashflow</p>
                      <p className="font-medium">
                        {formatCurrency(rental.monthly_rent - rental.monthly_expenses)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Current Value</p>
                      <p className="font-medium">{formatCurrency(rental.current_value)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Equity</p>
                      <p className="font-medium text-primary-600">
                        {formatCurrency(rental.current_value - rental.purchase_price - rental.rehab_cost)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}