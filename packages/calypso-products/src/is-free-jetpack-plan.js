/**
 * Internal dependencies
 */
import { PLAN_JETPACK_FREE } from './index';
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isFreeJetpackPlan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === PLAN_JETPACK_FREE;
}
