import { camelOrSnakeSlug } from './camel-or-snake-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isSiteRedirect( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return camelOrSnakeSlug( product ) === 'offsite_redirect';
}
