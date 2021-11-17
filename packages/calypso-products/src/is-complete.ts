import { isCompletePlan } from './main';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isComplete( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	if ( 'product_slug' in product ) {
		return isCompletePlan( product.product_slug );
	}
	return isCompletePlan( product.productSlug );
}
