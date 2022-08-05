import { camelOrSnakeProductType } from './camel-or-snake-product-type';
import type { WithCamelCaseProductType, WithSnakeCaseProductType } from './types';

export function isTheme( product: WithSnakeCaseProductType | WithCamelCaseProductType ): boolean {
	return 'theme' === camelOrSnakeProductType( product );
}
