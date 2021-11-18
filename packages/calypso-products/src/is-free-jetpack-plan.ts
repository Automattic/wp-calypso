import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { PLAN_JETPACK_FREE } from './constants';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isFreeJetpackPlan( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return camelOrSnakeSlug( product ) === PLAN_JETPACK_FREE;
}
