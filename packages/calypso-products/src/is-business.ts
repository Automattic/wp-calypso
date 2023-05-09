import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isBusinessPlan } from './main';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isBusiness( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return isBusinessPlan( camelOrSnakeSlug( product ) );
}
