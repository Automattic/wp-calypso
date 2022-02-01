import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isJetpackPlanSlug } from './is-jetpack-plan-slug';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isJetpackPlan( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return isJetpackPlanSlug( camelOrSnakeSlug( product ) );
}
