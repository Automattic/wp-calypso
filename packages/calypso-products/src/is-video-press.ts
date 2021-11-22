import { camelOrSnakeSlug } from './camel-or-snake-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isVideoPress( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return 'videopress' === camelOrSnakeSlug( product );
}
