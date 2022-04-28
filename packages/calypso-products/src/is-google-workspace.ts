import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isGoogleWorkspaceProductSlug } from './is-google-workspace-product-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isGoogleWorkspace( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isGoogleWorkspaceProductSlug( camelOrSnakeSlug( product ) );
}
