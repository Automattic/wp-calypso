import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isEcommercePlan } from './main';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isEcommerce( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return isEcommercePlan( camelOrSnakeSlug( product ) );
}
