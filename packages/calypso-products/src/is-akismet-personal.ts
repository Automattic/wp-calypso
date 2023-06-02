import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { AKISMET_PERSONAL_PRODUCTS } from './constants/akismet';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isAkismetPersonal( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return ( AKISMET_PERSONAL_PRODUCTS as ReadonlyArray< string > ).includes(
		camelOrSnakeSlug( product )
	);
}
