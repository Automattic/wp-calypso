/**
 * Internal dependencies
 */
import { isBloggerPlan } from '@automattic/calypso-products';
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isBlogger( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isBloggerPlan( product.product_slug );
}
