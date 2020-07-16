/**
 * Internal dependencies
 */
import { DefaultRootState } from 'react-redux';
import type { CartValue, CartItemValue } from 'lib/cart-values/types';
import { isJetpackBackup, isJetpackScan } from 'lib/products-values';
import { isJetpackSiteMultiSite } from 'state/sites/selectors';

type IncompatibleProducts = {
	products: CartItemValue[];
	reason: string;
	blockCheckout: boolean;
};

/**
 * Returns whether a checkout cart has incompatible products with a site.
 *
 * @param {DefaultRootState} state  Global state tree
 * @param {number} siteId  ID of a site
 * @param {CartValue} cart A checkout cart
 */
export default function getCheckoutIncompatibleProducts(
	state: DefaultRootState,
	siteId: number | null,
	cart: CartValue
): IncompatibleProducts | null {
	if ( ! siteId || cart.products.length === 0 ) {
		return null;
	}

	const isMultisite = isJetpackSiteMultiSite( state, siteId );

	if ( isMultisite ) {
		const incompatibleProducts = cart.products.filter(
			( p ): p is CartItemValue => isJetpackBackup( p ) || isJetpackScan( p )
		);
		if ( incompatibleProducts.length > 0 ) {
			return {
				products: incompatibleProducts,
				reason: 'multisite-incompatibility',
				blockCheckout: true,
			};
		}
	}

	// We can add other rules here.

	return null;
}
