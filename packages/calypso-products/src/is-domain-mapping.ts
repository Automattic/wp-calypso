import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isDomainMapping( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	if ( 'product_slug' in product ) {
		return product.product_slug === 'domain_map';
	}
	return product.productSlug === 'domain_map';
}
