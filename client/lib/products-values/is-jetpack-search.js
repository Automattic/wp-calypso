/**
 * Internal dependencies
 */
import { JETPACK_SEARCH_PRODUCTS } from 'calypso/lib/products-values/constants';
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isJetpackSearch( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return JETPACK_SEARCH_PRODUCTS.includes( product.product_slug );
}
