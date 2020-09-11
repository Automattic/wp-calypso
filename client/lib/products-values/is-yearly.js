/**
 * Internal dependencies
 */
import { PLAN_ANNUAL_PERIOD } from 'lib/plans/constants';
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';

export function isYearly( rawProduct ) {
	const product = formatProduct( rawProduct );
	assertValidProduct( product );

	return parseInt( product.bill_period, 10 ) === PLAN_ANNUAL_PERIOD;
}
