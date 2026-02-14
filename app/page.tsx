'use client'

import { useState, useMemo } from 'react'

export default function Home() {
  // Property Details
  const [address, setAddress] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  
  // ARV Estimates
  const [arvManual, setArvManual] = useState('')
  const [zillow, setZillow] = useState('')
  const [redfin, setRedfin] = useState('')
  const [realtor, setRealtor] = useState('')
  
  // Comps
  const [comps, setComps] = useState([
    { address: '', price: '', condition: 'good' },
    { address: '', price: '', condition: 'good' },
    { address: '', price: '', condition: 'good' },
  ])
  
  // Rehab
  const [rehab, setRehab] = useState('')
  const [rehabTemplate, setRehabTemplate] = useState('custom')
  const contingency = 0.10
  
  // Financing
  const [ltc, setLtc] = useState(80)
  const [interestRate, setInterestRate] = useState(12)
  const [holdMonths, setHoldMonths] = useState(5)
  
  // Closing Costs
  const [buyingCosts, setBuyingCosts] = useState('')
  const [commission, setCommission] = useState(6)
  const [sellingCosts, setSellingCosts] = useState('')
  
  // JV
  const [jvEnabled, setJvEnabled] = useState(false)
  
  // BRRRR
  const [brrrrExpanded, setBrrrrExpanded] = useState(false)

  // Calculations
  const avgComps = useMemo(() => {
    const validComps = comps.filter(c => c.price).map(c => parseFloat(c.price) || 0)
    return validComps.length > 0 ? validComps.reduce((a, b) => a + b, 0) / validComps.length : 0
  }, [comps])

  const arv = useMemo(() => {
    const manual = parseFloat(arvManual) || 0
    if (manual > 0) return manual
    const estimates = [zillow, redfin, realtor].map(e => parseFloat(e) || 0).filter(e => e > 0)
    if (estimates.length > 0) return estimates.reduce((a, b) => a + b, 0) / estimates.length
    return avgComps
  }, [arvManual, zillow, redfin, realtor, avgComps])

  const pp = parseFloat(purchasePrice) || 0
  const r = parseFloat(rehab) || 0
  const rehabWithContingency = r * (1 + contingency)
  
  // 70% Rule MAO
  const mao70 = Math.max(0, arv * 0.7 - r)
  
  // Loan calculations
  const loanAmount = (pp + r) * (ltc / 100)
  const monthlyInterest = (loanAmount * (interestRate / 100)) / 12
  const totalInterest = monthlyInterest * holdMonths
  
  // Closing costs
  const bc = parseFloat(buyingCosts) || 0
  const sellingCommission = arv * (parseFloat(commission) || 0) / 100
  const sc = parseFloat(sellingCosts) || 0
  
  // Profit calculations
  const profit = arv - pp - rehabWithContingency - totalInterest - bc - sellingCommission - sc
  const roi = pp > 0 ? (profit / pp) * 100 : 0
  
  // MAO for $50k profit
  const mao50k = Math.max(0, arv - r - totalInterest - bc - sellingCommission - sc - 50000)
  
  // Exit strategies
  const wholesaleSpread = arv - mao70
  const wholesaleViable = wholesaleSpread >= 15000
  const flipViable = profit >= 50000 && roi >= 20

  const formatCurrency = (num: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num)

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-9a2 2 0 012-2h4a2 2 0 012 2v9"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">FlipAnalyzer</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Real Estate Investment Tools</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-sm font-semibold transition-colors">
            + New Deal
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Analyze. <span className="text-amber-400">Profit.</span> Repeat.
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            Professional real estate deal analysis for investors who want to make data-driven decisions.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            {/* Property Details */}
            <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>🏡</span> Property Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="123 Main St, City, TX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ARV Estimator */}
            <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>💰</span> ARV Estimator
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Manual ARV Override</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    value={arvManual}
                    onChange={(e) => setArvManual(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-blue-600 mb-1">Zillow</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-2 py-2 border border-blue-200 rounded-lg text-sm"
                    value={zillow}
                    onChange={(e) => setZillow(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-red-600 mb-1">Redfin</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-2 py-2 border border-red-200 rounded-lg text-sm"
                    value={redfin}
                    onChange={(e) => setRedfin(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-green-600 mb-1">Realtor</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-2 py-2 border border-green-200 rounded-lg text-sm"
                    value={realtor}
                    onChange={(e) => setRealtor(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Using ARV:</span>
                  <span className="text-2xl font-bold text-amber-600">{formatCurrency(arv)}</span>
                </div>
              </div>
            </section>

            {/* Rehab Costs */}
            <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>🔨</span> Rehab Costs
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Template</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  value={rehabTemplate}
                  onChange={(e) => {
                    setRehabTemplate(e.target.value)
                    const templates: Record<string, string> = {
                      cosmetic: '25000',
                      starter: '65000',
                      fullGut: '120000',
                      custom: ''
                    }
                    setRehab(templates[e.target.value] || '')
                  }}
                >
                  <option value="custom">Custom</option>
                  <option value="cosmetic">Cosmetic (~$25K)</option>
                  <option value="starter">Starter Home (~$65K)</option>
                  <option value="fullGut">Full Gut (~$120K)</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Rehab Budget</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    value={rehab}
                    onChange={(e) => setRehab(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">With {Math.round(contingency * 100)}% Contingency:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(rehabWithContingency)}</span>
                </div>
              </div>
            </section>

            {/* Financing */}
            <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>🏦</span> Financing
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Loan to Cost (LTC)</label>
                <div className="flex gap-2">
                  {[75, 80, 85].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setLtc(pct)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        ltc === pct
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Interest Rate</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      value={interestRate}
                      onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hold (months)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    value={holdMonths}
                    onChange={(e) => setHoldMonths(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Exit Strategy */}
            <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🎯</span> Exit Strategy
              </h2>
              
              <div className="space-y-3">
                <div className={`p-3 rounded-lg border-2 transition-all ${
                  wholesaleViable ? 'bg-green-500/20 border-green-400' : 'bg-white/10 border-white/20'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">Wholesale</div>
                      <div className="text-sm opacity-80">Spread: {formatCurrency(wholesaleSpread)}</div>
                    </div>
                    {wholesaleViable && <span className="text-green-400">✓ Viable</span>}
                  </div>
                </div>

                <div className={`p-3 rounded-lg border-2 transition-all ${
                  flipViable ? 'bg-green-500/20 border-green-400' : 'bg-white/10 border-white/20'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">Flip</div>
                      <div className="text-sm opacity-80">Profit: {formatCurrency(profit)} ({roi.toFixed(1)}% ROI)</div>
                    </div>
                    {flipViable && <span className="text-green-400">✓ Viable</span>}
                  </div>
                </div>

                <div className="p-3 rounded-lg border-2 bg-white/10 border-white/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">BRRRR</div>
                      <div className="text-sm opacity-80">Refinance & keep</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Offer Calculator */}
            <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>💵</span> Offer Calculator
              </h2>
              
              <div className="space-y-3">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-green-700 mb-1">70% Rule MAO</div>
                  <div className="text-2xl font-bold text-green-800">{formatCurrency(mao70)}</div>
                  <div className="text-xs text-green-600 mt-1">(ARV × 70%) − Rehab</div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="text-sm text-amber-700 mb-1">MAO for $50K Profit</div>
                  <div className="text-2xl font-bold text-amber-800">{formatCurrency(mao50k)}</div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-slate-600">Max Recommended</div>
                      <div className="text-xl font-bold text-slate-900">{formatCurrency(Math.min(mao70, mao50k))}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Deal Summary */}
            <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>📊</span> Deal Summary
              </h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">ARV</span>
                  <span className="font-medium">{formatCurrency(arv)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Purchase</span>
                  <span className="font-medium">{formatCurrency(pp)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Rehab (with buffer)</span>
                  <span className="font-medium">{formatCurrency(rehabWithContingency)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Holding Costs</span>
                  <span className="font-medium">{formatCurrency(totalInterest)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Closing Costs</span>
                  <span className="font-medium">{formatCurrency(bc + sellingCommission + sc)}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-slate-200">
                  <span className="font-bold text-slate-900">Net Profit</span>
                  <span className={`font-bold text-lg ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(profit)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-bold text-slate-900">ROI</span>
                  <span className={`font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {roi.toFixed(1)}%
                  </span>
                </div>
              </div>
            </section>

            {/* Verdict */}
            <section className={`rounded-xl shadow-lg p-6 text-center ${
              flipViable || wholesaleViable
                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                : 'bg-gradient-to-br from-red-500 to-red-600 text-white'
            }`}>
              <div className="text-4xl mb-2">{flipViable || wholesaleViable ? '✅' : '❌'}</div>
              <div className="text-2xl font-bold">
                {flipViable || wholesaleViable ? 'GO' : 'NO GO'}
              </div>
              <div className="text-sm opacity-90 mt-1">
                {flipViable || wholesaleViable 
                  ? 'Deal meets investment criteria'
                  : 'Deal does not meet minimum criteria'}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
