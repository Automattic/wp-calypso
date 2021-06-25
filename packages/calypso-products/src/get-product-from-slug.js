/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';
import { PRODUCTS_LIST } from './products-list';

export function getProductFromSlug( productSlug ) {
	if ( PRODUCTS_LIST[ productSlug ] ) {
		return formatProduct( PRODUCTS_LIST[ productSlug ] );
	}
	return productSlug; // Consistent behavior with `getPlan`.
}
