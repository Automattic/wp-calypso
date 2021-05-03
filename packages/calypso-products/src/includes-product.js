/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function includesProduct( products, product ) {
	product = formatProduct( product );

	return products.indexOf( product.product_slug ) >= 0;
}
