# Flip Deal Analyzer - Deployment Guide

## Quick Deploy to Vercel (5 minutes)

### Option 1: Vercel CLI (Fastest)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd /Users/travisassitant/.openclaw/workspace/flip-analyzer
   vercel
   ```

4. **Follow prompts:**
   - Link to existing project? No
   - Project name? `flip-analyzer` (or whatever you want)
   - Directory? `./` (current)

5. **Done!** You'll get a URL like:
   `https://flip-analyzer-xyz.vercel.app`

### Option 2: GitHub + Vercel (Recommended for updates)

1. **Create GitHub repo:**
   - Go to github.com/new
   - Name: `flip-analyzer`
   - Private or public

2. **Push code:**
   ```bash
   cd /Users/travisassitant/.openclaw/workspace/flip-analyzer
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/flip-analyzer.git
   git push -u origin main
   ```

3. **Connect to Vercel:**
   - Go to vercel.com/new
   - Import GitHub repo
   - Framework: Next.js
   - Deploy

4. **Auto-deploys:** Every push to GitHub auto-deploys

## Custom Domain (Optional)

1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Vercel dashboard → Project → Settings → Domains
3. Add domain and follow DNS instructions

## Environment Variables (For Database)

When ready to add Supabase:

1. Go to supabase.com → New Project
2. Get URL and anon key
3. In Vercel dashboard → Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Current Status

**What's Built:**
- ✅ Buy Box form (all criteria fields)
- ✅ Deal entry form with address, price, ARV, rehab
- ✅ Analysis calculations (70% Rule, CoC ROI, profit)
- ✅ Deal grading (A/B/C/D)
- ✅ Deal pipeline with status tracking
- ✅ Deal list with filtering and sorting
- ✅ Portfolio Dashboard (flips + rentals)
- ✅ Mobile-responsive design
- ✅ Authentication (login/signup)
- ✅ Database integration (Supabase)
- ✅ Zillow API integration (with mock data)
- ✅ Full portfolio accounting and metrics

**Coming Next:**
- Photo upload for deals
- Real Zillow API (requires API key)
- Deal comparison tools
- Export to PDF
- Email notifications

## Support

Questions? The app is at:
`/Users/travisassitant/.openclaw/workspace/flip-analyzer`
