import { isJetpackPlan } from './is-jetpack-plan';
import { isPremium } from './is-premium';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isJetpackPremium( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isPremium( product ) && isJetpackPlan( product );
}
