const ZILLOW_API_KEY = process.env.NEXT_PUBLIC_ZILLOW_API_KEY || '';
const ZILLOW_API_BASE = 'https://api.bridgedataoutput.com/api/v2';

export interface ZillowSearchResult {
  success: boolean;
  data?: {
    zpid: string;
    address: string;
    zipcode: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    livingArea: number;
    lotSize?: number;
    propertyType: string;
    photos: string[];
    zestimate?: number;
    daysOnMarket?: number;
    description?: string;
    yearBuilt?: number;
  };
  error?: string;
}

export async function searchPropertyByAddress(address: string): Promise<ZillowSearchResult> {
  try {
    // Note: This uses a mock implementation since actual Zillow API requires paid access
    // In production, replace with actual API call
    
    // Mock response for demo purposes
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Parse address (simplified)
    const zipMatch = address.match(/\d{5}(-\d{4})?$/);
    const zipcode = zipMatch ? zipMatch[0] : '';
    
    return {
      success: true,
      data: {
        zpid: Math.random().toString(36).substring(7),
        address: address,
        zipcode: zipcode,
        price: 750000,
        bedrooms: 4,
        bathrooms: 2.5,
        livingArea: 2400,
        lotSize: 0.6,
        propertyType: 'Single Family',
        photos: [],
        zestimate: 780000,
        daysOnMarket: 12,
        description: 'Beautiful single-family home in prime location',
        yearBuilt: 1995,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch property data',
    };
  }
}

export async function getZestimate(address: string): Promise<number | null> {
  const result = await searchPropertyByAddress(address);
  return result.data?.zestimate || null;
}

export async function getComps(address: string, radius: number = 1): Promise<any[]> {
  // Mock comparable sales data
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [
    { address: '123 Similar St', salePrice: 825000, saleDate: '2025-01-15', sqft: 2500 },
    { address: '456 Nearby Ave', salePrice: 795000, saleDate: '2025-01-10', sqft: 2350 },
    { address: '789 Close Blvd', salePrice: 850000, saleDate: '2024-12-20', sqft: 2600 },
  ];
}

// Helper to estimate ARV based on comps
export function estimateARV(comps: any[]): number {
  if (comps.length === 0) return 0;
  const avgPrice = comps.reduce((sum, comp) => sum + comp.salePrice, 0) / comps.length;
  return Math.round(avgPrice);
}