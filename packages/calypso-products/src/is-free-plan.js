/**
 * Internal dependencies
 */
import { PLAN_FREE } from './index';
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isFreePlanProduct( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === PLAN_FREE;
}
