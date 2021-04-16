/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isBundled( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return !! product.is_bundled;
}
