import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isProPlan } from './main';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isPro( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return isProPlan( camelOrSnakeSlug( product ) );
}
