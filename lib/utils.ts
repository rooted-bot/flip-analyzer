import { DealAnalysis, DealGrade } from '@/types';

export function getGradeColor(grade: DealGrade): string {
  switch (grade) {
    case 'A': return 'bg-green-500 text-white';
    case 'B': return 'bg-blue-500 text-white';
    case 'C': return 'bg-yellow-500 text-white';
    case 'D': return 'bg-red-500 text-white';
    default: return 'bg-gray-400 text-white';
  }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function calculatePortfolioStats(deals: any[], analyses: Record<string, DealAnalysis>) {
  const activeDeals = deals.filter(d => d.status !== 'dead');
  const closedDeals = deals.filter(d => d.status === 'closed');
  
  const totalProjectedProfit = activeDeals.reduce((sum, deal) => {
    return sum + (analyses[deal.id!]?.projectedProfit || 0);
  }, 0);

  const totalActualProfit = closedDeals.reduce((sum, deal) => {
    // Would use actual profit from deal.actualProfit when implemented
    return sum + (analyses[deal.id!]?.projectedProfit || 0);
  }, 0);

  const avgCashOnCash = activeDeals.length > 0
    ? activeDeals.reduce((sum, deal) => sum + (analyses[deal.id!]?.cashOnCashRoi || 0), 0) / activeDeals.length
    : 0;

  const totalInvestment = activeDeals.reduce((sum, deal) => {
    return sum + (analyses[deal.id!]?.totalInvestment || 0);
  }, 0);

  const gradeCounts = { A: 0, B: 0, C: 0, D: 0 };
  activeDeals.forEach(deal => {
    const grade = analyses[deal.id!]?.grade;
    if (grade) gradeCounts[grade]++;
  });

  return {
    totalDeals: deals.length,
    activeDeals: activeDeals.length,
    closedDeals: closedDeals.length,
    totalProjectedProfit,
    totalActualProfit,
    avgCashOnCash,
    totalInvestment,
    gradeCounts,
  };
}