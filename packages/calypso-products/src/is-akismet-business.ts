import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { AKISMET_BUSINESS_PRODUCTS } from './constants/akismet';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isAkismetBusiness( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return ( AKISMET_BUSINESS_PRODUCTS as ReadonlyArray< string > ).includes(
		camelOrSnakeSlug( product )
	);
}
