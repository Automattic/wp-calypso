import { camelOrSnakeSlug } from './camel-or-snake-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isTheme( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return 'premium_theme' === camelOrSnakeSlug( product );
}
