/**
 * Internal dependencies
 */
import { isP2PlusPlan } from './index';
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isP2Plus( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isP2PlusPlan( product.product_slug );
}
