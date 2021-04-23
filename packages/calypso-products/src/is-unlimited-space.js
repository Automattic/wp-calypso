/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isUnlimitedSpace( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'unlimited_space' === product.product_slug;
}
