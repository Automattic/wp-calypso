import type { Purchase } from './types';

/**
 * Cancel intent sourced from the entry point the user came from.
 * `cancel`      = clicked "Cancel subscription" on Purchase Settings.
 * `remove`      = clicked "Remove subscription / Remove {product}" on Purchase Settings.
 * `auto-renew`  = toggled off auto-renew on Purchase Settings.
 * Absent means flag-off, old deep link, or flow-type heuristic fallback.
 */
export type CancelIntent = 'cancel' | 'remove' | 'auto-renew';

export function getCancelIntentFromQuery( query: {
	intent?: string | string[] | null;
} ): CancelIntent | null {
	const raw = Array.isArray( query.intent ) ? query.intent[ 0 ] : query.intent;
	return raw === 'cancel' || raw === 'remove' || raw === 'auto-renew' ? raw : null;
}

/**
 * The set of UI variants the cancel/confirmation screens can render. Currently
 * 1:1 with CancelIntent — kept as a separate alias because callers often
 * compute a display variant from intent plus a flow-type fallback.
 */
export type DisplayVariant = 'cancel' | 'remove' | 'auto-renew';

/**
 * Finds a purchase by the slug of its associated product.
 * @param {Purchase[]} purchases List of purchases to search in
 * @param {string} slug Product slug
 * @returns {Purchase} Found purchase, if any
 */
export function getPurchaseByProductSlug(
	purchases: Purchase[],
	slug: string
): Purchase | undefined {
	return purchases.find( ( purchase ) => purchase.productSlug === slug );
}
