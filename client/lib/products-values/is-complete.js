/**
 * Internal dependencies
 */
import { isCompletePlan } from 'calypso/lib/plans';
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isComplete( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isCompletePlan( product.product_slug );
}
