/**
 * Internal dependencies
 */
import { isBusinessPlan } from '@automattic/calypso-products';
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isBusiness( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isBusinessPlan( product.product_slug );
}
