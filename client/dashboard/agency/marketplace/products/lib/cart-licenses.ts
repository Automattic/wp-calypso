import { PRESSABLE_HOSTING_FAMILY_SLUG, WPCOM_HOSTING_FAMILY_SLUG } from '../../lib/wpcom-hosting';
import { MAX_CART_ITEM_QUANTITY } from '../use-shopping-cart';
import type { AgencyProduct } from '@automattic/api-core';

/** The most licenses of one product an agency can buy in one order. */
export const MAX_PRODUCT_LICENSES = 10;

/**
 * How many of `product` one cart line can hold: a Pressable plan is the
 * agency's one plan (adding another swaps it), WordPress.com hosting counts
 * sites, and every other product stops at the per-order maximum.
 */
export function getMaxLicenses( product: Pick< AgencyProduct, 'slug' | 'family_slug' > ): number {
	if ( product.family_slug === PRESSABLE_HOSTING_FAMILY_SLUG ) {
		return 1;
	}
	if ( product.family_slug === WPCOM_HOSTING_FAMILY_SLUG ) {
		return MAX_CART_ITEM_QUANTITY;
	}
	return MAX_PRODUCT_LICENSES;
}

/**
 * Whether the cart can hold more than one of `product`. The previous billing
 * system's checkout takes product names only, so the count is for agencies on
 * Billing Dragon. A referral sends the client one WordPress.com site.
 */
export function canHoldLicenses(
	product: Pick< AgencyProduct, 'slug' | 'family_slug' >,
	{ isReferralMode, isLegacyBilling }: { isReferralMode: boolean; isLegacyBilling: boolean }
): boolean {
	if ( isLegacyBilling ) {
		return false;
	}
	if ( isReferralMode && product.family_slug === WPCOM_HOSTING_FAMILY_SLUG ) {
		return false;
	}
	return getMaxLicenses( product ) > 1;
}
