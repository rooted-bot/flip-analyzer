export interface FlipProject {
  id?: string;
  user_id: string;
  address: string;
  zip_code: string;
  purchase_price: number;
  rehab_budget: number;
  rehab_actual?: number;
  holding_costs_monthly: number;
  arv: number;
  list_price?: number;
  sale_price?: number;
  sale_date?: string;
  purchase_date: string;
  status: FlipStatus;
  contractor_name?: string;
  contractor_phone?: string;
  lender_name?: string;
  loan_amount?: number;
  interest_rate?: number;
  loan_term_months?: number;
  photos?: string[];
  notes?: string;
  expenses?: FlipExpense[];
  milestones?: FlipMilestone[];
  created_at: string;
  updated_at: string;
}

export type FlipStatus = 
  | 'acquisition' 
  | 'rehab' 
  | 'marketing' 
  | 'under_contract' 
  | 'closing' 
  | 'completed' 
  | 'cancelled';

export interface FlipExpense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  receipt_url?: string;
}

export type ExpenseCategory = 
  | 'materials' 
  | 'labor' 
  | 'permits' 
  | 'utilities' 
  | 'insurance' 
  | 'holding_costs' 
  | 'selling_costs' 
  | 'other';

export interface FlipMilestone {
  id: string;
  date: string;
  title: string;
  completed: boolean;
}

export interface RentalProperty {
  id?: string;
  user_id: string;
  address: string;
  zip_code: string;
  purchase_price: number;
  rehab_cost: number;
  current_value: number;
  monthly_rent: number;
  monthly_expenses: number;
  mortgage_payment?: number;
  property_taxes_annual: number;
  insurance_annual: number;
  purchase_date: string;
  status: RentalStatus;
  tenant_name?: string;
  lease_start?: string;
  lease_end?: string;
  property_manager?: string;
  photos?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type RentalStatus = 'vacant' | 'occupied' | 'under_rehab' | 'for_sale' | 'sold';

export interface PortfolioSummary {
  // Flips
  active_flips: number;
  completed_flips_12mo: number;
  total_flip_profit_12mo: number;
  avg_flip_profit: number;
  avg_flip_timeline_days: number;
  
  // Rentals
  total_rental_units: number;
  total_monthly_rent: number;
  total_monthly_cashflow: number;
  portfolio_value: number;
  total_equity: number;
  
  // Overall
  total_portfolio_value: number;
  annualized_return: number;
  cash_on_cash_return: number;
}