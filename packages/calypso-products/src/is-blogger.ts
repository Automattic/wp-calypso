import { isBloggerPlan } from './main';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isBlogger( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	if ( 'product_slug' in product ) {
		return isBloggerPlan( product.product_slug );
	}
	return isBloggerPlan( product.productSlug );
}
