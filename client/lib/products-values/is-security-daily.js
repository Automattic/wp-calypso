/**
 * Internal dependencies
 */
import { isSecurityDailyPlan } from '@automattic/calypso-products';
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isSecurityDaily( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isSecurityDailyPlan( product.product_slug );
}
