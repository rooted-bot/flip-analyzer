// Integration Layer: Flip Analyzer ↔ Rooted Wealth
// Syncs real estate deals from Flip Analyzer to Rooted Wealth assets

import { supabase as flipAnalyzerDb } from '@/lib/supabase';

// Types for Flip Analyzer deal data
interface FlipDeal {
  id: string;
  user_id: string;
  address: string;
  purchase_price: number;
  arv: number;
  rehab_estimate: number;
  status: 'analyzed' | 'offered' | 'under_contract' | 'closed' | 'dead';
  profit_potential?: number;
  date_analyzed: string;
  date_closed?: string;
}

// Types for Rooted Wealth API
interface RootedWealthAsset {
  user_id: string;
  name: string;
  type: 'real_estate';
  current_value: number;
  cost_basis: number;
  purchase_date?: string;
  address: string;
  flip_analyzer_deal_id: string;
  description?: string;
}

/**
 * Sync a closed Flip Analyzer deal to Rooted Wealth as an asset
 * Call this when a deal moves to "closed" status
 */
export async function syncDealToRootedWealth(dealId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Fetch the deal from Flip Analyzer database
    const { data: deal, error: dealError } = await flipAnalyzerDb
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return { success: false, error: 'Deal not found' };
    }

    // Only sync closed deals
    if (deal.status !== 'closed') {
      return { success: false, error: 'Deal must be closed before syncing' };
    }

    // 2. Prepare asset data for Rooted Wealth
    const assetData: RootedWealthAsset = {
      user_id: deal.user_id,
      name: `Flip: ${deal.address.split(',')[0]}`, // Use street address as name
      type: 'real_estate',
      current_value: deal.arv || deal.purchase_price,
      cost_basis: deal.purchase_price + (deal.rehab_estimate || 0),
      purchase_date: deal.date_closed || deal.date_analyzed,
      address: deal.address,
      flip_analyzer_deal_id: deal.id,
      description: `Flip deal from Flip Analyzer. ARV: $${deal.arv?.toLocaleString()}, Rehab: $${deal.rehab_estimate?.toLocaleString()}`,
    };

    // 3. Send to Rooted Wealth API
    // In production, this would call the Rooted Wealth API endpoint
    // For now, we assume both apps share the same Supabase or use REST API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ROOTED_WEALTH_URL}/api/sync/asset`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ROOTED_WEALTH_API_KEY}`,
        },
        body: JSON.stringify(assetData),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to sync: ${error}`);
    }

    // 4. Mark deal as synced in Flip Analyzer
    await flipAnalyzerDb
      .from('deals')
      .update({ synced_to_rooted_wealth: true, synced_at: new Date().toISOString() })
      .eq('id', dealId);

    return { success: true };
  } catch (error: any) {
    console.error('Sync error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sync all closed deals for a user to Rooted Wealth
 * Useful for initial sync or bulk updates
 */
export async function syncAllClosedDeals(userId: string): Promise<{
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let synced = 0;
  let failed = 0;

  try {
    // Get all closed deals that haven't been synced
    const { data: deals, error } = await flipAnalyzerDb
      .from('deals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'closed')
      .or('synced_to_rooted_wealth.is.null,synced_to_rooted_wealth.eq.false');

    if (error) throw error;

    for (const deal of deals || []) {
      const result = await syncDealToRootedWealth(deal.id);
      if (result.success) {
        synced++;
      } else {
        failed++;
        errors.push(`Deal ${deal.id}: ${result.error}`);
      }
    }

    return { success: true, synced, failed, errors };
  } catch (error: any) {
    return { success: false, synced, failed, errors: [...errors, error.message] };
  }
}

/**
 * Get portfolio summary from Rooted Wealth for a user
 * This can be displayed in Flip Analyzer to show user's overall position
 */
export async function getRootedWealthSummary(userId: string): Promise<{
  net_worth: number;
  total_assets: number;
  real_estate_value: number;
  flip_deals_count: number;
} | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ROOTED_WEALTH_URL}/api/summary?userId=${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.ROOTED_WEALTH_API_KEY}`,
        },
      }
    );

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch Rooted Wealth summary:', error);
    return null;
  }
}

/**
 * Webhook handler for Rooted Wealth → Flip Analyzer updates
 * Call this when an asset is updated in Rooted Wealth
 */
export async function handleRootedWealthWebhook(payload: {
  event: 'asset_updated' | 'asset_deleted';
  asset_id: string;
  flip_analyzer_deal_id?: string;
  user_id: string;
}): Promise<void> {
  if (!payload.flip_analyzer_deal_id) return;

  if (payload.event === 'asset_updated') {
    // Optionally update deal in Flip Analyzer with new valuation
    // This enables bi-directional sync
    await flipAnalyzerDb
      .from('deals')
      .update({ last_valuation_sync: new Date().toISOString() })
      .eq('id', payload.flip_analyzer_deal_id);
  }
}

/**
 * Pre-qualification check for Rooted Lending
 * Uses Flip Analyzer deal data + Rooted Wealth net worth to determine loan eligibility
 */
export async function checkPreQualification(
  userId: string,
  dealId: string
): Promise<{
  eligible: boolean;
  max_loan_amount?: number;
  reason?: string;
  ltv_ratio?: number;
}> {
  try {
    // Get deal details
    const { data: deal } = await flipAnalyzerDb
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single();

    if (!deal) {
      return { eligible: false, reason: 'Deal not found' };
    }

    // Get user's net worth from Rooted Wealth
    const wealthSummary = await getRootedWealthSummary(userId);

    if (!wealthSummary) {
      // Fallback: basic qualification based on deal alone
      const ltv = (deal.purchase_price / (deal.arv || deal.purchase_price)) * 100;
      if (ltv <= 70) {
        return { 
          eligible: true, 
          max_loan_amount: deal.purchase_price * 0.8,
          ltv_ratio: ltv
        };
      }
      return { eligible: false, reason: 'LTV ratio too high (>70%)' };
    }

    // Advanced qualification using net worth
    const ltv = (deal.purchase_price / (deal.arv || deal.purchase_price)) * 100;
    const liquidityRatio = wealthSummary.total_assets / deal.purchase_price;

    // Eligibility criteria
    if (ltv > 80) {
      return { eligible: false, reason: 'LTV ratio too high (>80%)', ltv_ratio: ltv };
    }

    if (liquidityRatio < 0.25) {
      return { 
        eligible: false, 
        reason: 'Insufficient liquidity (need 25% of purchase price in assets)',
        ltv_ratio: ltv
      };
    }

    // Calculate max loan based on net worth
    const maxLoan = Math.min(
      deal.purchase_price * 0.85, // Max 85% LTV
      wealthSummary.net_worth * 0.5 // Max 50% of net worth
    );

    return {
      eligible: true,
      max_loan_amount: maxLoan,
      ltv_ratio: ltv,
    };
  } catch (error: any) {
    return { eligible: false, reason: `Error: ${error.message}` };
  }
}

/**
 * Submit loan application to Rooted Lending
 * Pre-fills application with Flip Analyzer deal data
 */
export async function submitLoanApplication(
  userId: string,
  dealId: string,
  loanAmount: number
): Promise<{ success: boolean; applicationId?: string; error?: string }> {
  try {
    // Get deal details
    const { data: deal } = await flipAnalyzerDb
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single();

    if (!deal) {
      return { success: false, error: 'Deal not found' };
    }

    // Check pre-qualification first
    const preQual = await checkPreQualification(userId, dealId);
    if (!preQual.eligible) {
      return { success: false, error: preQual.reason };
    }

    if (loanAmount > (preQual.max_loan_amount || 0)) {
      return { 
        success: false, 
        error: `Requested amount exceeds max qualification of $${preQual.max_loan_amount?.toLocaleString()}` 
      };
    }

    // Submit to Rooted Lending
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ROOTED_LENDING_URL}/api/applications`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ROOTED_LENDING_API_KEY}`,
        },
        body: JSON.stringify({
          user_id: userId,
          flip_analyzer_deal_id: dealId,
          property_address: deal.address,
          purchase_price: deal.purchase_price,
          arv: deal.arv,
          rehab_estimate: deal.rehab_estimate,
          loan_amount: loanAmount,
          ltv_ratio: preQual.ltv_ratio,
          source: 'flip_analyzer',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const result = await response.json();

    // Update deal with application reference
    await flipAnalyzerDb
      .from('deals')
      .update({ 
        rooted_lending_application_id: result.application_id,
        loan_application_date: new Date().toISOString()
      })
      .eq('id', dealId);

    return { success: true, applicationId: result.application_id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
