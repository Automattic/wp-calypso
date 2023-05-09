import { camelOrSnakeSlug } from './camel-or-snake-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isSpaceUpgrade( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return [
		'1gb_space_upgrade',
		'5gb_space_upgrade',
		'10gb_space_upgrade',
		'50gb_space_upgrade',
		'100gb_space_upgrade',
	].includes( camelOrSnakeSlug( product ) );
}
