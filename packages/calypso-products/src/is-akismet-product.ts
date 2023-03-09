import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { AKISMET_PRODUCTS_LIST } from './constants/akismet';
import type { WithSnakeCaseSlug } from './types';

export function isAkismetProduct( product: WithSnakeCaseSlug ): boolean {
	return ( AKISMET_PRODUCTS_LIST as ReadonlyArray< string > ).includes(
		camelOrSnakeSlug( product )
	);
}
