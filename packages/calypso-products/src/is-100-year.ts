import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { is100YearPlan } from './main';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function is100Year( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return is100YearPlan( camelOrSnakeSlug( product ) );
}
