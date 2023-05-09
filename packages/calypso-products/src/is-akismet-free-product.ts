import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { PRODUCT_AKISMET_FREE } from './constants/akismet';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isAkismetFreeProduct( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return PRODUCT_AKISMET_FREE === camelOrSnakeSlug( product );
}
