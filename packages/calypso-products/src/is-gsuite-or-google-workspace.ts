import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isGSuiteOrGoogleWorkspaceProductSlug } from './is-gsuite-or-google-workspace-product-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isGSuiteOrGoogleWorkspace(
	product: WithCamelCaseSlug | WithSnakeCaseSlug
): boolean {
	return isGSuiteOrGoogleWorkspaceProductSlug( camelOrSnakeSlug( product ) );
}
