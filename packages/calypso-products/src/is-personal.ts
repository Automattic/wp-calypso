import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isPersonalPlan } from './main';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isPersonal( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isPersonalPlan( camelOrSnakeSlug( product ) );
}
