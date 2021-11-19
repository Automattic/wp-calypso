import { camelOrSnakeSlug } from './camel-or-snake-slug';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isGuidedTransfer( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return 'guided_transfer' === camelOrSnakeSlug( product );
}
