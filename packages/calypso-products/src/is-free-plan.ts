import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { PLAN_FREE } from './constants';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isFreePlanProduct( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return camelOrSnakeSlug( product ) === PLAN_FREE;
}
