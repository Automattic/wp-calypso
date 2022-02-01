import { isJetpackPlan } from './is-jetpack-plan';
import { isPlan } from './is-plan';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isDotComPlan( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return isPlan( product ) && ! isJetpackPlan( product );
}
