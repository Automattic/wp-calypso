import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isJetpackSearchSlug } from './is-jetpack-search-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isJetpackSearch( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isJetpackSearchSlug( camelOrSnakeSlug( product ) );
}
