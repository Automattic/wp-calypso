import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY } from './constants';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isGoogleWorkspaceMonthly(
	product: WithCamelCaseSlug | WithSnakeCaseSlug
): boolean {
	return GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY === camelOrSnakeSlug( product );
}
