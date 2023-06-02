import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isSecurityRealTimePlan } from './main';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isSecurityRealTime( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return isSecurityRealTimePlan( camelOrSnakeSlug( product ) );
}
