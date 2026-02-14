import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 100;
const RATE_WINDOW = 60 * 1000;

export async function rateLimit(
  request: NextRequest,
  identifier?: string
): Promise<{ allowed: boolean; remaining: number }> {
  const key = identifier || request.ip || 'anonymous';
  const now = Date.now();
  
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_WINDOW,
    });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

export function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, '').replace(/['";\-\-]/g, '').trim().slice(0, 1000);
}

export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
