/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function includesProduct( products, product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return products.indexOf( product.product_slug ) >= 0;
}
