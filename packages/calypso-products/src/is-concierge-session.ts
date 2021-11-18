import { camelOrSnakeSlug } from './camel-or-snake-slug';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isConciergeSession( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return 'concierge-session' === camelOrSnakeSlug( product );
}
