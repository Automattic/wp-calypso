/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function isVideoPress( product ) {
	product = formatProduct( product );

	return 'videopress' === product.product_slug;
}
