import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isJetpackStatsSlug } from './is-jetpack-stats-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isJetpackStats( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isJetpackStatsSlug( camelOrSnakeSlug( product ) );
}
