import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { MARKETPLACE_THEME_SLUGS } from './constants';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

/**
 * Checks if the given product is a marketplace theme.
 *
 * @param product The product to check
 * @returns boolean True if the product is a marketplace theme
 */
export function isMarketplaceTheme( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return ( MARKETPLACE_THEME_SLUGS as ReadonlyArray< string > ).includes(
		camelOrSnakeSlug( product )
	);
}
