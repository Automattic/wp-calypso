/**
 * Internal dependencies
 */
import { PLAN_BIENNIAL_PERIOD } from '@automattic/calypso-products';
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isBiennially( rawProduct ) {
	const product = formatProduct( rawProduct );
	assertValidProduct( product );

	return parseInt( product.bill_period, 10 ) === PLAN_BIENNIAL_PERIOD;
}
