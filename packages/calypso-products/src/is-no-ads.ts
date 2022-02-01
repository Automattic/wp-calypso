import { camelOrSnakeSlug } from './camel-or-snake-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isNoAds( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return 'no-adverts/no-adverts.php' === camelOrSnakeSlug( product );
}
