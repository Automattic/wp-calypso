/**
 * Internal dependencies
 */
import { PLAN_FREE } from '@automattic/calypso-products';
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isFreePlan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === PLAN_FREE;
}
