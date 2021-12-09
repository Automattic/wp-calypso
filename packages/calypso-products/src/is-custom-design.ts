import { camelOrSnakeSlug } from './camel-or-snake-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isCustomDesign( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return 'custom-design' === camelOrSnakeSlug( product );
}
