/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isVideoPress( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'videopress' === product.product_slug;
}
