import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { TITAN_MAIL_SLUGS } from './constants';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isTitanMail( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return ( TITAN_MAIL_SLUGS as ReadonlyArray< string > ).includes( camelOrSnakeSlug( product ) );
}
