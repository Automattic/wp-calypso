import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isStarterPlan } from './main';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isStarter( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return isStarterPlan( camelOrSnakeSlug( product ) );
}
