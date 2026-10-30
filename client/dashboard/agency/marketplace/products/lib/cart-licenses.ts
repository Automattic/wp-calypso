import { formatNumber } from '@automattic/number-formatters';
import { _n, sprintf } from '@wordpress/i18n';
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

/**
 * The count of a cart line with the price of one, such as "3 licenses at
 * $149.00/yr each". WordPress.com hosting counts sites.
 */
export function getLicenseCountText( {
	quantity,
	unitPrice,
	isSite,
}: {
	quantity: number;
	/** The formatted price of one, with its term. */
	unitPrice: string;
	isSite: boolean;
} ): string {
	return isSite
		? sprintf(
				/* translators: %1$s is the number of sites, %2$s the price of one, such as "$25.00/mo". */
				_n( '%1$s site at %2$s each', '%1$s sites at %2$s each', quantity ),
				formatNumber( quantity ),
				unitPrice
			)
		: sprintf(
				/* translators: %1$s is the number of licenses, %2$s the price of one, such as "$149.00/yr". */
				_n( '%1$s license at %2$s each', '%1$s licenses at %2$s each', quantity ),
				formatNumber( quantity ),
				unitPrice
			);
}
