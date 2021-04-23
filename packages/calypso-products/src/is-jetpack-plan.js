/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';
import { isJetpackPlanSlug } from './is-jetpack-plan-slug';

export function isJetpackPlan( product ) {
	product = snakeCase( product );

	return isJetpackPlanSlug( product.product_slug );
}
