import { isBusinessPlan } from './main';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isBusiness( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	if ( 'product_slug' in product ) {
		return isBusinessPlan( product.product_slug );
	}
	return isBusinessPlan( product.productSlug );
}
