import { camelOrSnakeSlug } from './camel-or-snake-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isVipPlan( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return 'vip' === camelOrSnakeSlug( product );
}
