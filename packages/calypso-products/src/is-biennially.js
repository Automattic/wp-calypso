/**
 * Internal dependencies
 */
import { PLAN_BIENNIAL_PERIOD } from './constants';
import { formatProduct } from './format-product';

export function isBiennially( rawProduct ) {
	const product = formatProduct( rawProduct );

	return parseInt( product.bill_period, 10 ) === PLAN_BIENNIAL_PERIOD;
}
