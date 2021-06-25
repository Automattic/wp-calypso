/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';
import { isJetpackPlanSlug } from './is-jetpack-plan-slug';

export function isJetpackPlan( product ) {
	product = formatProduct( product );

	return isJetpackPlanSlug( product.product_slug );
}
