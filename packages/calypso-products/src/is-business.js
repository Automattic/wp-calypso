/**
 * Internal dependencies
 */
import { isBusinessPlan } from '@automattic/calypso-products';
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isBusiness( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isBusinessPlan( product.product_slug );
}
