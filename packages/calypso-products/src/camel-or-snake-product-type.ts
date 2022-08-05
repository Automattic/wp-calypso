import type { WithSnakeCaseProductType, WithCamelCaseProductType } from './types';

export function camelOrSnakeProductType(
	product: WithCamelCaseProductType | WithSnakeCaseProductType
): string {
	return 'product_type' in product ? product.product_type : product.productType;
}
