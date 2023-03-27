import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { AKISMET_PERSONAL_PRODUCTS } from './constants/akismet';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isAkismetPersonalProduct(
	product: WithSnakeCaseSlug | WithCamelCaseSlug
): boolean {
	return ( AKISMET_PERSONAL_PRODUCTS as ReadonlyArray< string > ).includes(
		camelOrSnakeSlug( product )
	);
}
