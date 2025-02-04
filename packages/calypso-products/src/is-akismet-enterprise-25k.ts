import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { AKISMET_ENTERPRISE_25K_PRODUCTS } from './constants/akismet';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isAkismetEnterprise25k( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return ( AKISMET_ENTERPRISE_25K_PRODUCTS as ReadonlyArray< string > ).includes(
		camelOrSnakeSlug( product )
	);
}
