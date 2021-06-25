/**
 * Internal dependencies
 */
import { PLAN_ANNUAL_PERIOD } from './constants';
import { formatProduct } from './format-product';

export function isYearly( rawProduct ) {
	const product = formatProduct( rawProduct );

	return parseInt( product.bill_period, 10 ) === PLAN_ANNUAL_PERIOD;
}
