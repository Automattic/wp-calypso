import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isDomainRedemption( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	if ( 'product_slug' in product ) {
		return product.product_slug === 'domain_redemption';
	}
	return product.productSlug === 'domain_redemption';
}
