import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { AKISMET_BUSINESS_5K_PRODUCTS } from './constants/akismet';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isAkismetBusiness5k( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return ( AKISMET_BUSINESS_5K_PRODUCTS as ReadonlyArray< string > ).includes(
		camelOrSnakeSlug( product )
	);
}
