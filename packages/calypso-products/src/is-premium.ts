import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isPremiumPlan } from './main';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isPremium( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isPremiumPlan( camelOrSnakeSlug( product ) );
}
