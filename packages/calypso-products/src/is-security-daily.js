/**
 * Internal dependencies
 */
import { isSecurityDailyPlan } from '@automattic/calypso-products';
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isSecurityDaily( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isSecurityDailyPlan( product.product_slug );
}
