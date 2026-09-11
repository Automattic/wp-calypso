import { PLAN_EXPIRY_NOTICE_DISMISS_META_KEY_SUFFIX } from '@automattic/api-core';
import type { Purchase, SiteUserMeta } from '@automattic/api-core';

/**
 * The stored key the banner dismisses to on this site. The server prefixes the
 * base name per site (`wp_` on Atomic, `wp_{blog_id}_` on Simple) and exposes
 * the registered key on `users/me` whether or not it has a value yet, so the
 * exact name is read back rather than guessed.
 */
export function findPlanExpiryNoticeDismissMetaKey(
	meta: SiteUserMeta | undefined
): string | undefined {
	return Object.keys( meta ?? {} ).find( ( key ) =>
		key.endsWith( '_' + PLAN_EXPIRY_NOTICE_DISMISS_META_KEY_SUFFIX )
	);
}

/**
 * A dismissal only counts for the term it was made in: the server stamps the
 * time of the click, so a stamp older than the current expiry date belongs to
 * a previous term and the notice comes back. Same rule as
 * `Expiry_Notice_Dismiss::is_dismissed()` in jetpack-mu-wpcom.
 */
export function isPlanExpiryNoticeDismissed(
	dismissedAt: number | undefined,
	purchase: Purchase
): boolean {
	if ( ! dismissedAt ) {
		return false;
	}
	return dismissedAt * 1000 > new Date( purchase.expiry_date ).getTime();
}
