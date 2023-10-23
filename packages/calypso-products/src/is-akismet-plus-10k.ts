import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { AKISMET_PLUS_10K_PRODUCTS } from './constants/akismet';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isAkismetPlus10k( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return ( AKISMET_PLUS_10K_PRODUCTS as ReadonlyArray< string > ).includes(
		camelOrSnakeSlug( product )
	);
}
