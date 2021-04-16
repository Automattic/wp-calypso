/**
 * Internal dependencies
 */
import { PLAN_MONTHLY_PERIOD } from '@automattic/calypso-products';
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isMonthly( rawProduct ) {
	const product = formatProduct( rawProduct );
	assertValidProduct( product );

	return parseInt( product.bill_period, 10 ) === PLAN_MONTHLY_PERIOD;
}
