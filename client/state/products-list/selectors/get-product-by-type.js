/**
 * External dependencies
 */
import { get, filter } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/products-list/init';

/**
 * Retrieves the product with the specified slug.
 *
 * @param {object} state - global state tree
 * @param {string} productType - internal product type, eg 'marketplace'
 * @returns {?object} the products list, or null if not found
 */
export function getProductByType( state, productType ) {
	return filter(
		get( state, [ 'productsList', 'items' ], [] ),
		{ product_type: productType },
		null
	);
}
