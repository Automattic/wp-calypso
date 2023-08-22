import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isCentennialPlan } from './main';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isHundredYearPlan( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return isCentennialPlan( camelOrSnakeSlug( product ) );
}
