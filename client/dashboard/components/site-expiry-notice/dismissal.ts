import { PLAN_EXPIRY_NOTICE_DISMISS_META_KEY_SUFFIX } from '@automattic/api-core';
import type { Purchase, SiteUserMeta } from '@automattic/api-core';

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
 * A dismissal only counts for the term it was made in: a stamp older than the
 * current expiry date belongs to a previous term and the notice comes back.
 * Same rule as `Expiry_Notice_Dismiss::is_dismissed()` in jetpack-mu-wpcom.
 */
export function isPlanExpiryNoticeDismissed(
	dismissedAt: number | undefined,
	purchase: Purchase
): boolean {
	if ( ! dismissedAt ) {
		return false;
	}
	return dismissedAt * 1000 >= new Date( purchase.expiry_date ).getTime();
}
