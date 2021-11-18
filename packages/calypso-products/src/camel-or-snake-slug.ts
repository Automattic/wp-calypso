import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function camelOrSnakeSlug( product: WithCamelCaseSlug | WithSnakeCaseSlug ): string {
	return 'product_slug' in product ? product.product_slug : product.productSlug;
}
