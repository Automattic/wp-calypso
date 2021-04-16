/**
 * Internal dependencies
 */
import { isCompletePlan } from '@automattic/calypso-products';
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isComplete( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isCompletePlan( product.product_slug );
}
