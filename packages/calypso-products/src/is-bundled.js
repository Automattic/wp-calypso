/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function isBundled( product ) {
	product = formatProduct( product );

	return !! product.is_bundled;
}
