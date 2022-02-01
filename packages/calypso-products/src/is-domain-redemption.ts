import { camelOrSnakeSlug } from './camel-or-snake-slug';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isDomainRedemption( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return camelOrSnakeSlug( product ) === 'domain_redemption';
}
