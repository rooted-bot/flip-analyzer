-- Flip Deal Analyzer Database Schema
-- Run this in Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Deals table
CREATE TABLE deals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  list_price INTEGER NOT NULL,
  estimated_arv INTEGER NOT NULL,
  rehab_estimate INTEGER NOT NULL,
  lot_size DECIMAL(10,2),
  square_feet INTEGER,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  property_type TEXT NOT NULL,
  days_on_market INTEGER,
  photos TEXT[],
  notes TEXT,
  status TEXT DEFAULT 'lead',
  analysis JSONB,
  -- Rooted Ecosystem Integration Fields
  synced_to_rooted_wealth BOOLEAN DEFAULT false,
  synced_at TIMESTAMP WITH TIME ZONE,
  rooted_lending_application_id TEXT,
  loan_application_date TIMESTAMP WITH TIME ZONE,
  last_valuation_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buy Boxes table
CREATE TABLE buy_boxes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  zip_codes TEXT[] NOT NULL,
  min_lot_size DECIMAL(10,2) NOT NULL,
  max_lot_size DECIMAL(10,2),
  property_types TEXT[] NOT NULL,
  max_purchase_price INTEGER NOT NULL,
  min_arv INTEGER,
  max_arv INTEGER,
  min_cash_on_cash DECIMAL(5,2) NOT NULL,
  max_rehab_budget INTEGER NOT NULL,
  holding_period_months INTEGER NOT NULL,
  target_profit_min INTEGER NOT NULL,
  hard_money_rate DECIMAL(5,2) NOT NULL,
  hard_money_points DECIMAL(5,2) NOT NULL,
  selling_costs_percent DECIMAL(5,2) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flip Projects table
CREATE TABLE flip_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  purchase_price INTEGER NOT NULL,
  rehab_budget INTEGER NOT NULL,
  rehab_actual INTEGER,
  holding_costs_monthly INTEGER,
  arv INTEGER NOT NULL,
  list_price INTEGER,
  sale_price INTEGER,
  sale_date DATE,
  purchase_date DATE NOT NULL,
  status TEXT DEFAULT 'acquisition',
  contractor_name TEXT,
  contractor_phone TEXT,
  lender_name TEXT,
  loan_amount INTEGER,
  interest_rate DECIMAL(5,2),
  loan_term_months INTEGER,
  photos TEXT[],
  notes TEXT,
  expenses JSONB,
  milestones JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rental Properties table
CREATE TABLE rental_properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  purchase_price INTEGER NOT NULL,
  rehab_cost INTEGER NOT NULL DEFAULT 0,
  current_value INTEGER NOT NULL,
  monthly_rent INTEGER NOT NULL,
  monthly_expenses INTEGER NOT NULL DEFAULT 0,
  mortgage_payment INTEGER,
  property_taxes_annual INTEGER NOT NULL DEFAULT 0,
  insurance_annual INTEGER NOT NULL DEFAULT 0,
  purchase_date DATE NOT NULL,
  status TEXT DEFAULT 'vacant',
  tenant_name TEXT,
  lease_start DATE,
  lease_end DATE,
  property_manager TEXT,
  photos TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE buy_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flip_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_properties ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deals
CREATE POLICY "Users can view own deals" ON deals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own deals" ON deals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deals" ON deals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deals" ON deals
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for buy_boxes
CREATE POLICY "Users can view own buy boxes" ON buy_boxes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own buy boxes" ON buy_boxes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own buy boxes" ON buy_boxes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own buy boxes" ON buy_boxes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for flip_projects
CREATE POLICY "Users can view own flips" ON flip_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own flips" ON flip_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flips" ON flip_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flips" ON flip_projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for rental_properties
CREATE POLICY "Users can view own rentals" ON rental_properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own rentals" ON rental_properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rentals" ON rental_properties
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rentals" ON rental_properties
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_buy_boxes_user_id ON buy_boxes(user_id);
CREATE INDEX idx_flip_projects_user_id ON flip_projects(user_id);
CREATE INDEX idx_flip_projects_status ON flip_projects(status);
CREATE INDEX idx_rental_properties_user_id ON rental_properties(user_id);
CREATE INDEX idx_rental_properties_status ON rental_properties(status);

-- ============================================================
-- ROOTED ECOSYSTEM INTEGRATION
-- ============================================================

-- Function to notify when deal is closed (for webhook trigger)
CREATE OR REPLACE FUNCTION notify_deal_closed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'closed' AND (OLD.status IS NULL OR OLD.status != 'closed') THEN
    -- Notify for external webhook processing
    PERFORM pg_notify('deal_closed', json_build_object(
      'deal_id', NEW.id,
      'user_id', NEW.user_id,
      'address', NEW.address,
      'list_price', NEW.list_price,
      'estimated_arv', NEW.estimated_arv,
      'rehab_estimate', NEW.rehab_estimate
    )::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-notify on deal close
CREATE TRIGGER on_deal_closed
  AFTER UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION notify_deal_closed();

-- Index for sync tracking
CREATE INDEX idx_deals_synced ON deals(synced_to_rooted_wealth) WHERE synced_to_rooted_wealth = false;