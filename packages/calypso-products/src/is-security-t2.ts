import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isSecurityT2Plan } from './main';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isSecurityT2( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isSecurityT2Plan( camelOrSnakeSlug( product ) );
}
