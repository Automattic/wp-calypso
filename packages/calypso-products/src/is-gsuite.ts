import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isGoogleWorkspaceProductSlug, isGSuiteProductSlug } from './gsuite-product-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isGoogleWorkspace( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isGoogleWorkspaceProductSlug( camelOrSnakeSlug( product ) );
}

export function isGSuite( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isGSuiteProductSlug( camelOrSnakeSlug( product ) );
}
