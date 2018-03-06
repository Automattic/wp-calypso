/** @format */

/**
 * Internal dependencies
 */
import { SIMPLE_PAYMENTS_PRODUCT_GET, SIMPLE_PAYMENTS_PRODUCTS_LIST } from 'state/action-types';

export const requestProducts = siteId => ( {
	siteId,
	type: SIMPLE_PAYMENTS_PRODUCTS_LIST,
} );

export const requestProduct = ( siteId, productId ) => ( {
	siteId,
	productId,
	type: SIMPLE_PAYMENTS_PRODUCT_GET,
} );
