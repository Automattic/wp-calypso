import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { AKISMET_ENTERPRISE_PRODUCTS } from './constants';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isAkismetEnterprise( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return ( AKISMET_ENTERPRISE_PRODUCTS as ReadonlyArray< string > ).includes(
		camelOrSnakeSlug( product )
	);
}
