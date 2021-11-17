import { isJetpackPlanSlug } from './is-jetpack-plan-slug';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isJetpackPlan( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	const slug = 'product_slug' in product ? product.product_slug : product.productSlug;
	return isJetpackPlanSlug( slug );
}
