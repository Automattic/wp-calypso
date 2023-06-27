import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { PRODUCT_JETPACK_STATS_FREE_YEARLY } from './constants/jetpack';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isJetpackStatsFree( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return PRODUCT_JETPACK_STATS_FREE_YEARLY === camelOrSnakeSlug( product );
}
