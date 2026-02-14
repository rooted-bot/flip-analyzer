'use client';

import { useState } from 'react';
import { syncDealToRootedWealth } from '@/lib/rooted-integration';
import { checkPreQualification } from '@/lib/rooted-integration';

interface SyncStatusProps {
  dealId: string;
  userId: string;
  status: string;
  syncedToRootedWealth?: boolean;
  syncedAt?: string;
  onSync?: () => void;
}

export default function SyncStatus({ 
  dealId, 
  userId, 
  status, 
  syncedToRootedWealth, 
  syncedAt,
  onSync 
}: SyncStatusProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preQual, setPreQual] = useState<{ eligible: boolean; max_loan_amount?: number; reason?: string } | null>(null);
  const [showPreQual, setShowPreQual] = useState(false);

  const handleSync = async () => {
    if (status !== 'closed') {
      setError('Deal must be closed before syncing to Rooted Wealth');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await syncDealToRootedWealth(dealId);
    
    if (result.success) {
      onSync?.();
    } else {
      setError(result.error || 'Sync failed');
    }
    
    setLoading(false);
  };

  const handleCheckPreQual = async () => {
    setLoading(true);
    const result = await checkPreQualification(userId, dealId);
    setPreQual(result);
    setShowPreQual(true);
    setLoading(false);
  };

  // If already synced
  if (syncedToRootedWealth) {
    return (
      <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-medium">
          Synced to Rooted Wealth
          {syncedAt && <span className="text-emerald-500 ml-1">({new Date(syncedAt).toLocaleDateString()})</span>}
        </span>
      </div>
    );
  }

  // If deal is not closed yet
  if (status !== 'closed') {
    return (
      <div className="flex items-center space-x-2 text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm">Close deal to sync to portfolio</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={handleSync}
          disabled={loading}
          className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
          <span>Sync to Rooted Wealth</span>
        </button>

        <button
          onClick={handleCheckPreQual}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Check Pre-Qualification</span>
        </button>
      </div>

      {showPreQual && preQual && (
        <div className={`p-4 rounded-lg ${preQual.eligible ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center space-x-2 mb-2">
            {preQual.eligible ? (
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className={`font-semibold ${preQual.eligible ? 'text-emerald-900' : 'text-red-900'}`}>
              {preQual.eligible ? 'Pre-Qualified!' : 'Not Pre-Qualified'}
            </span>
          </div>
          
          {preQual.eligible && preQual.max_loan_amount && (
            <p className="text-emerald-800">
              Maximum loan amount: <span className="font-bold">${preQual.max_loan_amount.toLocaleString()}</span>
            </p>
          )}
          
          {!preQual.eligible && preQual.reason && (
            <p className="text-red-800">{preQual.reason}</p>
          )}

          {preQual.eligible && (
            <button
              onClick={() => window.open(`${process.env.NEXT_PUBLIC_ROOTED_LENDING_URL}/apply?deal=${dealId}`, '_blank')}
              className="mt-3 w-full bg-emerald-600 text-white py-2 rounded font-medium hover:bg-emerald-700 transition-colors"
            >
              Apply with Rooted Lending →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
