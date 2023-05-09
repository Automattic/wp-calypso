import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { domainProductSlugs } from './constants';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isDomainTransfer( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return camelOrSnakeSlug( product ) === domainProductSlugs.TRANSFER_IN;
}
