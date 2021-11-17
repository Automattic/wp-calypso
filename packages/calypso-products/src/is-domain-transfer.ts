import { domainProductSlugs } from './constants';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isDomainTransfer( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	if ( 'product_slug' in product ) {
		return product.product_slug === domainProductSlugs.TRANSFER_IN;
	}
	return product.productSlug === domainProductSlugs.TRANSFER_IN;
}
