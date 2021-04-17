/**
 * Internal dependencies
 */
import { PLAN_JETPACK_FREE } from './index';
import { formatProduct } from './format-product';

export function isFreeJetpackPlan( product ) {
	product = formatProduct( product );

	return product.product_slug === PLAN_JETPACK_FREE;
}
