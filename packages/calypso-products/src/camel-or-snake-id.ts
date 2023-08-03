import type { WithSnakeCaseId, WithCamelCaseId } from './types';

export function camelOrSnakeId( product: WithCamelCaseId | WithSnakeCaseId ): number {
	return 'product_id' in product ? product.product_id : product.productId;
}
