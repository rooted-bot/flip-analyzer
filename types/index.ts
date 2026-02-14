export interface BuyBox {
  id?: string;
  name: string;
  zipCodes: string[];
  minLotSize: number;
  maxLotSize?: number;
  propertyTypes: PropertyType[];
  maxPurchasePrice: number;
  minArv?: number;
  maxArv?: number;
  minCashOnCash: number;
  maxRehabBudget: number;
  holdingPeriodMonths: number;
  targetProfitMin: number;
  hardMoneyRate: number;
  hardMoneyPoints: number;
  sellingCostsPercent: number;
}

export type PropertyType = 'single-family' | 'townhouse' | 'condo' | 'multi-family';

export interface Deal {
  id?: string;
  address: string;
  zipCode: string;
  listPrice: number;
  estimatedArv: number;
  rehabEstimate: number;
  lotSize?: number;
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType: PropertyType;
  daysOnMarket?: number;
  photos?: string[];
  notes?: string;
  status: DealStatus;
  createdAt: string;
  updatedAt: string;
}

export type DealStatus = 'lead' | 'analyzed' | 'offered' | 'under-contract' | 'closed' | 'dead';

export interface DealAnalysis {
  dealId: string;
  maxOffer70Percent: number;
  totalInvestment: number;
  projectedProfit: number;
  cashOnCashRoi: number;
  annualizedRoi: number;
  holdingCosts: number;
  sellingCosts: number;
  hardMoneyCosts: number;
  grade: DealGrade;
  meetsBuyBox: boolean;
}

export type DealGrade = 'A' | 'B' | 'C' | 'D';

export interface ZillowProperty {
  zpid: string;
  address: string;
  zipcode: string;
  price: number;
  lotSize?: number;
  livingArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType: string;
  photos?: string[];
  zestimate?: number;
  daysOnMarket?: number;
}

// Re-export portfolio types
export * from './portfolio';