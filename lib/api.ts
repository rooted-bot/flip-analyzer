import { supabase } from './supabase';
import { Deal, BuyBox, DealAnalysis } from '@/types';

// Deals API
export async function createDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>, userId: string) {
  const { data, error } = await supabase
    .from('deals')
    .insert({
      ...deal,
      user_id: userId,
      status: deal.status || 'lead',
    })
    .select()
    .single();
  
  return { data, error };
}

export async function getDeals(userId: string) {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
}

export async function getDealById(dealId: string, userId: string) {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('id', dealId)
    .eq('user_id', userId)
    .single();
  
  return { data, error };
}

export async function updateDeal(dealId: string, updates: Partial<Deal>, userId: string) {
  const { data, error } = await supabase
    .from('deals')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', dealId)
    .eq('user_id', userId)
    .select()
    .single();
  
  return { data, error };
}

export async function deleteDeal(dealId: string, userId: string) {
  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', dealId)
    .eq('user_id', userId);
  
  return { error };
}

export async function saveDealAnalysis(dealId: string, analysis: DealAnalysis, userId: string) {
  const { data, error } = await supabase
    .from('deals')
    .update({
      analysis,
      updated_at: new Date().toISOString(),
    })
    .eq('id', dealId)
    .eq('user_id', userId)
    .select()
    .single();
  
  return { data, error };
}

// Buy Boxes API
export async function createBuyBox(buyBox: Omit<BuyBox, 'id'>, userId: string) {
  const { data, error } = await supabase
    .from('buy_boxes')
    .insert({
      ...buyBox,
      user_id: userId,
    })
    .select()
    .single();
  
  return { data, error };
}

export async function getBuyBoxes(userId: string) {
  const { data, error } = await supabase
    .from('buy_boxes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
}

export async function getDefaultBuyBox(userId: string) {
  const { data, error } = await supabase
    .from('buy_boxes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single();
  
  if (!data) {
    // Return first buy box if no default
    const { data: firstBox } = await supabase
      .from('buy_boxes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return { data: firstBox, error };
  }
  
  return { data, error };
}

export async function updateBuyBox(buyBoxId: string, updates: Partial<BuyBox>, userId: string) {
  const { data, error } = await supabase
    .from('buy_boxes')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', buyBoxId)
    .eq('user_id', userId)
    .select()
    .single();
  
  return { data, error };
}

export async function deleteBuyBox(buyBoxId: string, userId: string) {
  const { error } = await supabase
    .from('buy_boxes')
    .delete()
    .eq('id', buyBoxId)
    .eq('user_id', userId);
  
  return { error };
}

export async function setDefaultBuyBox(buyBoxId: string, userId: string) {
  // First, unset current default
  await supabase
    .from('buy_boxes')
    .update({ is_default: false })
    .eq('user_id', userId)
    .eq('is_default', true);
  
  // Set new default
  const { data, error } = await supabase
    .from('buy_boxes')
    .update({ is_default: true })
    .eq('id', buyBoxId)
    .eq('user_id', userId)
    .select()
    .single();
  
  return { data, error };
}