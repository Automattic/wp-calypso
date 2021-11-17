import { isEcommercePlan } from './main';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isEcommerce( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	if ( 'product_slug' in product ) {
		return isEcommercePlan( product.product_slug );
	}
	return isEcommercePlan( product.productSlug );
}
