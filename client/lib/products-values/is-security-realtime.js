/**
 * Internal dependencies
 */
import { isSecurityRealTimePlan } from 'lib/plans';
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';

export function isSecurityRealTime( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isSecurityRealTimePlan( product.product_slug );
}
