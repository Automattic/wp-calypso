/**
 * Internal dependencies
 */
import { isCompletePlan } from '@automattic/calypso-products';
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isComplete( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isCompletePlan( product.product_slug );
}
