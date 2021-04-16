/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';
import { isJetpackPlanSlug } from './is-jetpack-plan-slug';

export function isJetpackPlan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isJetpackPlanSlug( product.product_slug );
}
