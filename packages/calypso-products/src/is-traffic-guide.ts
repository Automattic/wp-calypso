import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { WPCOM_TRAFFIC_GUIDE } from './constants';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isTrafficGuide( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return WPCOM_TRAFFIC_GUIDE === camelOrSnakeSlug( product );
}
