import { camelOrSnakeId } from './camel-or-snake-id';
import type { WithCamelCaseId, WithSnakeCaseId } from './types';

/**
 * @param product Product to check.
 * @returns boolean indicating whether the product is a multi-year domain product.
 */
export function isMultiYearDomainProduct( product: WithCamelCaseId | WithSnakeCaseId ): boolean {
	return (
		( camelOrSnakeId( product ) === 6 || camelOrSnakeId( product ) === 76 ) && 'volume' in product
	);
}
