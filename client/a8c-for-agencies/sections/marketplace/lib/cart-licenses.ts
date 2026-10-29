import { isEnabled } from '@automattic/calypso-config';
import { isWPCOMHostingProduct } from './hosting';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

/** The most licenses of one product an agency can buy in one order. */
export const MAX_PRODUCT_LICENSES = 10;

/** The most sites one WordPress.com hosting line holds. */
const MAX_WPCOM_HOSTING_SITES = 100;

type CartProduct = Pick< APIProductFamilyProduct, 'slug' | 'family_slug' >;

/**
 * How many of `product` one cart line can hold: a Pressable plan is the
 * agency's one plan, WordPress.com hosting counts sites, and every other
 * product stops at the per-order maximum.
 */
export function getMaxLicenses( product: CartProduct ): number {
	if ( product.family_slug === 'pressable-hosting' ) {
		return 1;
	}
	if ( isWPCOMHostingProduct( product.family_slug ) ) {
		return MAX_WPCOM_HOSTING_SITES;
	}
	return MAX_PRODUCT_LICENSES;
}

/**
 * Whether the cart can hold more than one of `product`. The previous billing
 * system's checkout takes product bundles instead, so the count is for agencies
 * on Billing Dragon. A referral sends the client one WordPress.com site.
 */
export function canHoldLicenses( product: CartProduct, isReferralMode: boolean ): boolean {
	if ( ! isEnabled( 'a4a-bd-checkout' ) ) {
		return false;
	}
	if ( isReferralMode && isWPCOMHostingProduct( product.family_slug ) ) {
		return false;
	}
	return getMaxLicenses( product ) > 1;
}
