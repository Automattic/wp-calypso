import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isSecurityT0Plan } from './main';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isSecurityT0( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isSecurityT0Plan( camelOrSnakeSlug( product ) );
}
