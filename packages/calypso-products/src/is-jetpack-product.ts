import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isJetpackProductSlug } from './is-jetpack-product-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isJetpackProduct( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isJetpackProductSlug( camelOrSnakeSlug( product ) );
}
