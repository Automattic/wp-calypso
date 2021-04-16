/**
 * Internal dependencies
 */
import { isSecurityRealTimePlan } from '@automattic/calypso-products';
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isSecurityRealTime( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isSecurityRealTimePlan( product.product_slug );
}
