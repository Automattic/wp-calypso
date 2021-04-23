/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';
import { PRODUCTS_LIST } from './products-list';

export function getProductFromSlug( productSlug ) {
	if ( PRODUCTS_LIST[ productSlug ] ) {
		return snakeCase( PRODUCTS_LIST[ productSlug ] );
	}
	return productSlug; // Consistent behavior with `getPlan`.
}
