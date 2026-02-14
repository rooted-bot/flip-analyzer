// Environment variable validation for Flip Analyzer

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
}

const requiredEnvVars: EnvVar[] = [
  // Supabase (Required)
  { name: 'NEXT_PUBLIC_SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true, description: 'Supabase anon key' },
  
  // Zillow (Optional)
  { name: 'ZILLOW_API_KEY', required: false, description: 'Zillow API key for property data' },
  
  // Rooted Ecosystem Integration (Optional)
  { name: 'NEXT_PUBLIC_ROOTED_WEALTH_URL', required: false, description: 'Rooted Wealth URL for sync' },
  { name: 'ROOTED_WEALTH_API_KEY', required: false, description: 'API key for Rooted Wealth integration' },
  { name: 'NEXT_PUBLIC_ROOTED_LENDING_URL', required: false, description: 'Rooted Lending URL for loan applications' },
];

export function validateEnv(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name];
    
    if (!value || value.trim() === '') {
      if (envVar.required) {
        errors.push(`Missing required environment variable: ${envVar.name} (${envVar.description})`);
      } else {
        warnings.push(`Missing optional environment variable: ${envVar.name} (${envVar.description})`);
      }
    }
  }
  
  // Additional validation
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must start with https://');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function logEnvStatus(): void {
  const { valid, errors, warnings } = validateEnv();
  
  if (errors.length > 0) {
    console.error('❌ Environment Validation Errors:');
    errors.forEach(err => console.error(`  - ${err}`));
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️  Environment Warnings (optional features disabled):');
    warnings.forEach(warn => console.warn(`  - ${warn}`));
  }
  
  if (valid && warnings.length === 0) {
    console.log('✅ All environment variables configured');
  }
}

// Run validation on startup in production
if (process.env.NODE_ENV === 'production') {
  const { valid, errors } = validateEnv();
  if (!valid) {
    throw new Error(`Environment validation failed: ${errors.join(', ')}`);
  }
}
