import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isJetpackVideoPressSlug } from './is-jetpack-videopress-slug';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isJetpackVideoPress( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return isJetpackVideoPressSlug( camelOrSnakeSlug( product ) );
}
