/**
 * Internal dependencies
 */
import { isSecurityRealTimePlan } from '@automattic/calypso-products';
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isSecurityRealTime( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isSecurityRealTimePlan( product.product_slug );
}
