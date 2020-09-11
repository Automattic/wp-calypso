/**
 * Internal dependencies
 */
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';

export function isFreeTrial( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return Boolean( product.free_trial );
}
