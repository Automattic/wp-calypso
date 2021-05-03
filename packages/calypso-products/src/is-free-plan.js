/**
 * Internal dependencies
 */
import { PLAN_FREE } from './constants';
import { formatProduct } from './format-product';

export function isFreePlanProduct( product ) {
	product = formatProduct( product );

	return product.product_slug === PLAN_FREE;
}
