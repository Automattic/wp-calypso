import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isCompletePlan } from './main';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isComplete( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return isCompletePlan( camelOrSnakeSlug( product ) );
}
