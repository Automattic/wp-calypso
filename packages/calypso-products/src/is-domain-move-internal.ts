import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { domainProductSlugs } from './constants';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isDomainMoveInternal( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return camelOrSnakeSlug( product ) === domainProductSlugs.DOMAIN_MOVE_INTERNAL;
}
