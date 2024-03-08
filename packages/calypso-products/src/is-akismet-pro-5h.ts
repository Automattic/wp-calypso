import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { AKISMET_PRO_500_PRODUCTS } from './constants/akismet';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isAkismetPro5h( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return ( AKISMET_PRO_500_PRODUCTS as ReadonlyArray< string > ).includes(
		camelOrSnakeSlug( product )
	);
}
