import type { ReferralPurchase } from '@automattic/api-core';

/**
 * WordPress.com hosting is placed by creating a site rather than by attaching
 * the license to one that already exists.
 */
export function isWpcomHostingPurchase( purchase: ReferralPurchase ) {
	return ( purchase.license?.license_key ?? '' ).startsWith( 'wpcom-hosting' );
}

/**
 * A purchase can only be put on a site once the client has paid for it and it
 * has not been placed yet. Pressable purchases are managed in Pressable, so the
 * agency never places them from here.
 */
export function canPlacePurchase( purchase: ReferralPurchase ) {
	const licenseKey = purchase.license?.license_key ?? '';
	return (
		purchase.status === 'active' &&
		! purchase.site_assigned &&
		!! licenseKey &&
		! licenseKey.startsWith( 'pressable-' )
	);
}

/**
 * A subscription the client cancelled keeps working until it expires, which the
 * purchase's own "Unassigned" or "Awaiting payment" status does not convey.
 */
export function isCancelledButActive( purchase: ReferralPurchase ) {
	const { subscription } = purchase;
	return (
		!! subscription && subscription.status === 'active' && ! subscription.is_auto_renew_enabled
	);
}
