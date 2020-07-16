/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { FEATURE_SPAM_AKISMET_PLUS } from 'lib/plans/constants';
import { isJetpackBackup, isJetpackScan } from 'lib/products-values';
import {
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	JETPACK_ANTI_SPAM_PRODUCTS,
} from 'lib/products-values/constants';
import { hasFeature } from 'state/sites/plans/selectors';
import isSiteWPCOM from 'state/selectors/is-site-wpcom';
import { isJetpackSiteMultiSite, hasSiteProduct } from 'state/sites/selectors';

/**
 * Type dependencies
 */
import type { AppState } from 'types';
import type { CartItemValue } from 'lib/cart-values/types';

/**
 * Checks if Jetpack Anti-Spam is conflicting with a site's current products.
 *
 * @param {AppState} state The redux state.
 * @param {number} siteId The site ID.
 * @returns {boolean|null} True for conflict, or null when it's unable to be determined.
 */
export const isAntiSpamConflicting = createSelector(
	( state: AppState, siteId: number ): boolean | null => {
		const planHasFeature = hasFeature( state, siteId, FEATURE_SPAM_AKISMET_PLUS );
		const isWPCOM = isSiteWPCOM( state, siteId );
		const hasAntiSpam = hasSiteProduct( state, siteId, JETPACK_ANTI_SPAM_PRODUCTS );
		return planHasFeature || isWPCOM || hasAntiSpam;
	},
	[
		( state: AppState, siteId: number ) => [
			hasFeature( state, siteId, FEATURE_SPAM_AKISMET_PLUS ),
			isSiteWPCOM( state, siteId ),
			hasSiteProduct( state, siteId, JETPACK_ANTI_SPAM_PRODUCTS ),
		],
	]
);

/**
 * Check if a given product conflicts with an existing site purchase.
 *
 * @param {AppState} state The redux state.
 * @param {number|null} siteId Either the site ID, or null.
 * @param {string} productSlug The product slug.
 * @returns {boolean|null} True or false, or null when it's unable to be determined.
 */
export default function isProductConflictingWithSite(
	state: AppState,
	siteId: number | null,
	productSlug: string
): boolean | null {
	if ( ! siteId ) {
		return null;
	}

	switch ( productSlug ) {
		case PRODUCT_JETPACK_ANTI_SPAM:
		case PRODUCT_JETPACK_ANTI_SPAM_MONTHLY:
			return isAntiSpamConflicting( state, siteId );
	}
	return null;
}

export type IncompatibleProducts = {
	products: CartItemValue[];
	reason: string;
	blockCheckout: boolean;
};

/**
 * Returns whether a checkout cart has incompatible products with a site.
 *
 * @param {AppState} state  Global state tree
 * @param {number} siteId  ID of a site
 * @param {CartItemValue} productsInCart A list of products of a checkout cart
 */
export function getCheckoutIncompatibleProducts(
	state: AppState,
	siteId: number | null,
	productsInCart: CartItemValue[]
): IncompatibleProducts | null {
	if ( ! siteId || productsInCart.length === 0 ) {
		return null;
	}

	const isMultisite = isJetpackSiteMultiSite( state, siteId );

	// Multisites shouldn't be allowed to purchase Jetpack Backup or Scan because
	// they are not supported at this time.
	if ( isMultisite ) {
		const incompatibleProducts = productsInCart.filter(
			( p ): p is CartItemValue => isJetpackBackup( p ) || isJetpackScan( p )
		);

		if ( incompatibleProducts.length === 0 ) {
			return null;
		}

		return {
			products: incompatibleProducts,
			reason: 'multisite-incompatibility',
			blockCheckout: true,
		};
	}

	// We can add other rules here.

	return null;
}
