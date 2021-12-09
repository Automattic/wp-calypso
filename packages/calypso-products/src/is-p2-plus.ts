import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isP2PlusPlan } from './main';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isP2Plus( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isP2PlusPlan( camelOrSnakeSlug( product ) );
}
