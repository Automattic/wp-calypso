import type { Purchase } from './types';

/**
 * The raw `expiry_status` uses hyphenated values (e.g. 'auto-renewing',
 * 'manual-renew', 'one-time-purchase'). The legacy assembler camelCased these,
 * so this predicate reads the raw hyphenated value directly.
 */
export function isPurchaseOneTimePurchase( purchase: Purchase ): boolean {
	return purchase.expiry_status === 'one-time-purchase';
}
