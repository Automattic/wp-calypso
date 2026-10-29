import { isPressableHostingProduct } from '../../hosting/lib/pressable-plans';
import { WPCOM_HOSTING_FAMILY_SLUG } from '../../lib/wpcom-hosting';
import { MAX_CART_ITEM_QUANTITY } from '../use-shopping-cart';
import { isPressablePhpMemoryAddon } from './pressable-memory-addon';
import type { AgencyProduct } from '@automattic/api-core';

/** The most licenses of one product an agency can buy in one order. */
export const MAX_PRODUCT_LICENSES = 10;

/**
 * How many of `product` one cart line can hold: a PHP memory add-on is bought
 * once per site, a Pressable plan is the agency's one plan (adding another
 * swaps it), WordPress.com hosting counts sites, and every other product stops
 * at the per-order maximum.
 */
export function getMaxLicenses( product: Pick< AgencyProduct, 'slug' | 'family_slug' > ): number {
	if ( isPressablePhpMemoryAddon( product ) || isPressableHostingProduct( product.family_slug ) ) {
		return 1;
	}
	if ( product.family_slug === WPCOM_HOSTING_FAMILY_SLUG ) {
		return MAX_CART_ITEM_QUANTITY;
	}
	return MAX_PRODUCT_LICENSES;
}

/**
 * Whether the cart can hold more than one of `product`. A referral sends the
 * client one of each, and the previous billing system's checkout takes product
 * names only, so the count is for agency purchases on Billing Dragon.
 */
export function canHoldLicenses(
	product: Pick< AgencyProduct, 'slug' | 'family_slug' >,
	{ isReferralMode, isLegacyBilling }: { isReferralMode: boolean; isLegacyBilling: boolean }
): boolean {
	return ! isReferralMode && ! isLegacyBilling && getMaxLicenses( product ) > 1;
}
