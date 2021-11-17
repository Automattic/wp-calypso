import { PLAN_FREE } from './constants';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isFreePlanProduct( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	const slug = 'product_slug' in product ? product.product_slug : product.productSlug;
	return slug === PLAN_FREE;
}
