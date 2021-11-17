import { PLAN_WPCOM_ENTERPRISE } from './constants';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isEnterprise( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	const slug = 'product_slug' in product ? product.product_slug : product.productSlug;
	return slug === PLAN_WPCOM_ENTERPRISE;
}
