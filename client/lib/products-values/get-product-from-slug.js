/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { PRODUCTS_LIST } from 'calypso/lib/products-values/products-list';

export function getProductFromSlug( productSlug ) {
	if ( PRODUCTS_LIST[ productSlug ] ) {
		return formatProduct( PRODUCTS_LIST[ productSlug ] );
	}
	return productSlug; // Consistent behavior with `getPlan`.
}
