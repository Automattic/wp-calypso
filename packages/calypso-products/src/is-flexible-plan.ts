import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { PLAN_WPCOM_FLEXIBLE } from './constants';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isFlexiblePlanProduct( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return camelOrSnakeSlug( product ) === PLAN_WPCOM_FLEXIBLE;
}
