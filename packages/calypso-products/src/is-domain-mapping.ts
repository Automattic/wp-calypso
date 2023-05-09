import { camelOrSnakeSlug } from './camel-or-snake-slug';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isDomainMapping( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return camelOrSnakeSlug( product ) === 'domain_map';
}
