import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isJetpackAntiSpamSlug } from './is-jetpack-anti-spam-slug';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isJetpackAntiSpam( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isJetpackAntiSpamSlug( camelOrSnakeSlug( product ) );
}
