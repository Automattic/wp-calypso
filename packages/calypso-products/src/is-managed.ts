import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isManagedPlan } from './main';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isManaged( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return isManagedPlan( camelOrSnakeSlug( product ) );
}
