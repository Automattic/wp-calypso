/**
 * External dependencies
 */
import { translate, TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import type { AppState } from 'types';
import type { CartValue, CartItemValue } from 'lib/cart-values/types';
import { isJetpackBackup, isJetpackScan } from 'lib/products-values';
import { isJetpackSiteMultiSite } from 'state/sites/selectors';

type IncompatibleProducts = {
	products: CartItemValue[];
	reason: string;
	blockCheckout: boolean;
	content: TranslateResult;
};

export default function getCheckoutIncompatibleProducts(
	state: AppState,
	siteId: number | null,
	cart: CartValue
): IncompatibleProducts | null {
	if ( ! siteId || cart.products.length === 0 ) {
		return null;
	}

	const isMultisite = isJetpackSiteMultiSite( state, siteId );

	// Multisites shouldn't be allowed to purchase Jetpack Backup or Scan because
	// they are not supported at this time.
	if ( isMultisite ) {
		const incompatibleProducts = cart.products.filter(
			( p ): p is CartItemValue => isJetpackBackup( p ) || isJetpackScan( p )
		);

		if ( incompatibleProducts.length === 0 ) {
			return null;
		}

		let content;
		if ( incompatibleProducts.length === 1 ) {
			content = translate(
				"We're sorry, %(productName)s is not compatible with multisite WordPress installations at this time.",
				{
					args: {
						productName: incompatibleProducts[ 0 ].product_name,
					},
				}
			);
		} else {
			content = translate(
				"We're sorry, %(productName1)s and %(productName2)s are not compatible with multisite WordPress installations at this time.",
				{
					args: {
						productName1: incompatibleProducts[ 0 ].product_name,
						productName2: incompatibleProducts[ 1 ].product_name,
					},
				}
			);
		}
		return {
			products: incompatibleProducts,
			reason: 'multisite-incompatibility',
			blockCheckout: true,
			content,
		};
	}

	// We can add other rules here.

	return null;
}
