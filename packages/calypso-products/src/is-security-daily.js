/**
 * Internal dependencies
 */
import { isSecurityDailyPlan } from './index';
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isSecurityDaily( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isSecurityDailyPlan( product.product_slug );
}
