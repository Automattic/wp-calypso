/**
 * Internal dependencies
 */
import { PLAN_MONTHLY_PERIOD } from './index';
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isMonthlyProduct( rawProduct ) {
	const product = formatProduct( rawProduct );
	assertValidProduct( product );

	return parseInt( product.bill_period, 10 ) === PLAN_MONTHLY_PERIOD;
}
