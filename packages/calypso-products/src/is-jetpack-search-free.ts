import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { PRODUCT_JETPACK_SEARCH_FREE } from './constants/jetpack';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isJetpackSearchFree( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return PRODUCT_JETPACK_SEARCH_FREE === camelOrSnakeSlug( product );
}
