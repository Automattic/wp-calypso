/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { TERM_MONTHLY, TERM_ANNUALLY, TERM_BIENNIALLY } from 'calypso/lib/plans/constants';
import { PRODUCTS_LIST } from 'calypso/lib/products-values/products-list';

/**
 * Type dependencies
 */
import type { ProductSlug } from 'calypso/lib/products-values/types';
import type { Product } from 'calypso/lib/products-values/products-list';

/**
 * Returns the billing term label for a product (i.e. "every month", "every year", "every two years").
 *
 * @param {ProductSlug} productSlug Product slug
 * @returns {string|undefined} Translated billing term label
 */
export function getProductBillingTermLabel( productSlug: ProductSlug ): string | undefined {
	const product: Product = PRODUCTS_LIST[ productSlug ];

	if ( product && product.term ) {
		switch ( product.term ) {
			case TERM_MONTHLY:
				return String( translate( 'monthly' ) );
			case TERM_ANNUALLY:
				return String( translate( 'yearly' ) );
			case TERM_BIENNIALLY:
				return String( translate( 'every two years' ) );
		}
	}

	return undefined;
}
