/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function includesProduct( products, product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return products.indexOf( product.product_slug ) >= 0;
}
