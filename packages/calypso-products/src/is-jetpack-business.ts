import { isBusiness } from './is-business';
import { isJetpackPlan } from './is-jetpack-plan';
import { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isJetpackBusiness( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isBusiness( product ) && isJetpackPlan( product );
}
