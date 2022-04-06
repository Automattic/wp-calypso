import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isGSuiteProductSlug } from './gsuite-product-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isGSuite( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isGSuiteProductSlug( camelOrSnakeSlug( product ) );
}
