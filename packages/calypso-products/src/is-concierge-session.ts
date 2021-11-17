import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isConciergeSession( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	if ( 'product_slug' in product ) {
		return 'concierge-session' === product.product_slug;
	}
	return 'concierge-session' === product.productSlug;
}
