import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isJetpackStarterPlan } from './main';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isJetpackStarter( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isJetpackStarterPlan( camelOrSnakeSlug( product ) );
}
