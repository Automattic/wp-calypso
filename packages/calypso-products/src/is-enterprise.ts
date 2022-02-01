import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { PLAN_WPCOM_ENTERPRISE } from './constants';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isEnterprise( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return camelOrSnakeSlug( product ) === PLAN_WPCOM_ENTERPRISE;
}
