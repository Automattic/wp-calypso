/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function isCustomDesign( product ) {
	product = formatProduct( product );

	return 'custom-design' === product.product_slug;
}
