/**
 * Internal dependencies
 */
import { PLAN_FREE } from './index';
import { formatProduct } from './format-product';

export function isFreePlanProduct( product ) {
	product = formatProduct( product );

	return product.product_slug === PLAN_FREE;
}
