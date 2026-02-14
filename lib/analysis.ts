import { BuyBox, Deal, DealAnalysis, DealGrade } from '@/types';

export function analyzeDeal(deal: Deal, buyBox: BuyBox): DealAnalysis {
  // 70% Rule calculation
  const maxOffer70Percent = (deal.estimatedArv * 0.7) - deal.rehabEstimate;
  
  // Investment breakdown
  const purchasePrice = deal.listPrice;
  const rehabCosts = deal.rehabEstimate;
  const hardMoneyLoanAmount = purchasePrice + rehabCosts;
  
  // Hard money costs
  const pointsCost = hardMoneyLoanAmount * (buyBox.hardMoneyPoints / 100);
  const monthlyInterestRate = buyBox.hardMoneyRate / 12 / 100;
  const monthlyInterestPayment = hardMoneyLoanAmount * monthlyInterestRate;
  const totalInterest = monthlyInterestPayment * buyBox.holdingPeriodMonths;
  const hardMoneyCosts = pointsCost + totalInterest;
  
  // Other holding costs (utilities, insurance, property taxes estimate)
  const monthlyHoldingCosts = 500; // Conservative estimate
  const otherHoldingCosts = monthlyHoldingCosts * buyBox.holdingPeriodMonths;
  const totalHoldingCosts = hardMoneyCosts + otherHoldingCosts;
  
  // Selling costs
  const sellingCosts = deal.estimatedArv * (buyBox.sellingCostsPercent / 100);
  
  // Total investment and profit
  const totalInvestment = purchasePrice + rehabCosts + totalHoldingCosts + sellingCosts;
  const projectedProfit = deal.estimatedArv - totalInvestment;
  
  // Cash-on-cash ROI
  // Assume investor puts down 20% of purchase + all rehab + holding costs
  const cashInvested = (purchasePrice * 0.2) + rehabCosts + totalHoldingCosts;
  const cashOnCashRoi = (projectedProfit / cashInvested) * 100;
  
  // Annualized ROI
  const annualizedRoi = cashOnCashRoi * (12 / buyBox.holdingPeriodMonths);
  
  // Grade the deal
  let grade: DealGrade = 'D';
  if (cashOnCashRoi >= 25) grade = 'A';
  else if (cashOnCashRoi >= 15) grade = 'B';
  else if (cashOnCashRoi >= 10) grade = 'C';
  
  // Check if meets buy box criteria
  const meetsBuyBox = 
    cashOnCashRoi >= buyBox.minCashOnCash &&
    projectedProfit >= buyBox.targetProfitMin &&
    rehabCosts <= buyBox.maxRehabBudget;
  
  return {
    dealId: deal.id || '',
    maxOffer70Percent,
    totalInvestment,
    projectedProfit,
    cashOnCashRoi,
    annualizedRoi,
    holdingCosts: totalHoldingCosts,
    sellingCosts,
    hardMoneyCosts,
    grade,
    meetsBuyBox
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}