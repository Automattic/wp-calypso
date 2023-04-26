import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { AKISMET_FREE_PRODUCTS } from './constants/akismet';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isAkismetFree( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return ( AKISMET_FREE_PRODUCTS as ReadonlyArray< string > ).includes(
		camelOrSnakeSlug( product )
	);
}
