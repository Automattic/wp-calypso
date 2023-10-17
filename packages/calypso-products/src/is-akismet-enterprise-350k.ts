import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { AKISMET_ENTERPRISE_350K_PRODUCTS } from './constants';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isAkismetEnterprise350k( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return ( AKISMET_ENTERPRISE_350K_PRODUCTS as ReadonlyArray< string > ).includes(
		camelOrSnakeSlug( product )
	);
}
