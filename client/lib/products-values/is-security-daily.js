/**
 * Internal dependencies
 */
import { isSecurityDailyPlan } from 'lib/plans';
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';

export function isSecurityDaily( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isSecurityDailyPlan( product.product_slug );
}
