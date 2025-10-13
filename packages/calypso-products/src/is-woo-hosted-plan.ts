import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isWooHostedPlan } from './main';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isWooHosted( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return isWooHostedPlan( camelOrSnakeSlug( product ) );
}
