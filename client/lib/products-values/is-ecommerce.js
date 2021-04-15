/**
 * Internal dependencies
 */
import { isEcommercePlan } from '@automattic/calypso-products';
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isEcommerce( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isEcommercePlan( product.product_slug );
}
