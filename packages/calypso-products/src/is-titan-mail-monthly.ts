import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { TITAN_MAIL_MONTHLY_SLUG } from './constants';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isTitanMailMonthly( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return TITAN_MAIL_MONTHLY_SLUG === camelOrSnakeSlug( product );
}
