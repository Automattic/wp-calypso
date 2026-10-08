import { PLAN_EXPIRY_NOTICE_DISMISS_META_KEY_SUFFIX } from '@automattic/api-core';
import type { SiteUserMeta } from '@automattic/api-core';

/**
 * The server prefixes the base name per site (`wp_` on Atomic, `wp_{blog_id}_`
 * on Simple), so the exact key is read back off `users/me` rather than guessed.
 */
export function findPlanExpiryNoticeDismissMetaKey(
	meta: SiteUserMeta | undefined
): string | undefined {
	return Object.keys( meta ?? {} ).find( ( key ) =>
		key.endsWith( '_' + PLAN_EXPIRY_NOTICE_DISMISS_META_KEY_SUFFIX )
	);
}

/**
 * The last second of the UTC day a purchase expires on, in milliseconds: the
 * `expiry_ts` jetpack-mu-wpcom's `Expiry_Data` judges a grace dismissal against.
 */
export function getPurchaseExpiryCutoff( expiryDate: string ): number {
	const expiresAt = new Date( expiryDate );
	return (
		Date.UTC( expiresAt.getUTCFullYear(), expiresAt.getUTCMonth(), expiresAt.getUTCDate() + 1 ) -
		1000
	);
}

/**
 * A dismissal only counts for the term it was made in: a stamp older than the
 * reference time (the end of the expiry day in grace, the revert in post-grace)
 * belongs to a previous term and the notice comes back. Same rule as
 * `Expiry_Notice_Dismiss::is_dismissed()` in jetpack-mu-wpcom.
 * @param dismissedAt   Unix seconds, as `users/me` meta stores it.
 * @param referenceTime Milliseconds since the epoch.
 */
export function isPlanExpiryNoticeDismissed(
	dismissedAt: number | undefined,
	referenceTime: number
): boolean {
	if ( ! dismissedAt ) {
		return false;
	}
	return dismissedAt * 1000 >= referenceTime;
}
