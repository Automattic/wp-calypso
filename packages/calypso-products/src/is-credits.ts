import { camelOrSnakeSlug } from './camel-or-snake-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isCredits( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return 'wordpress-com-credits' === camelOrSnakeSlug( product );
}
