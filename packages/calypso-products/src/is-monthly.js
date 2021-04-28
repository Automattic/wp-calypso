/**
 * Internal dependencies
 */
import { PLAN_MONTHLY_PERIOD } from './index';
import { formatProduct } from './format-product';

export function isMonthlyProduct( rawProduct ) {
	const product = formatProduct( rawProduct );

	return parseInt( product.bill_period, 10 ) === PLAN_MONTHLY_PERIOD;
}
