/**
 * Internal dependencies
 */
import { isCompletePlan } from 'lib/plans';
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';

export function isComplete( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isCompletePlan( product.product_slug );
}
