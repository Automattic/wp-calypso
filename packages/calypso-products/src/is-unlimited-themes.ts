import { camelOrSnakeSlug } from './camel-or-snake-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isUnlimitedThemes( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return 'unlimited_themes' === camelOrSnakeSlug( product );
}
