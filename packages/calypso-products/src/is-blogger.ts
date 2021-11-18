import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isBloggerPlan } from './main';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isBlogger( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return isBloggerPlan( camelOrSnakeSlug( product ) );
}
