import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { PLAN_CHARGEBACK } from './constants';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isChargeback( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return camelOrSnakeSlug( product ) === PLAN_CHARGEBACK;
}
