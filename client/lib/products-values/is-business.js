/**
 * Internal dependencies
 */
import { isBusinessPlan } from 'lib/plans';
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';

export function isBusiness( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isBusinessPlan( product.product_slug );
}
