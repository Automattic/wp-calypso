import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isSecurityDailyPlan } from './main';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isSecurityDaily( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isSecurityDailyPlan( camelOrSnakeSlug( product ) );
}
