import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isSecurityT1Plan } from './main';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isSecurityT1( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isSecurityT1Plan( camelOrSnakeSlug( product ) );
}
