import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { PRODUCT_1GB_SPACE } from './constants';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

/**
 * This deals with the tiered volume space addon. Also see ./is-space-upgrade.ts for other
 * storage products.
 * @param product Product name
 * @returns boolean indicating whether the product is a space addon.
 */
export function isTieredVolumeSpaceAddon(
	product: WithCamelCaseSlug | WithSnakeCaseSlug
): boolean {
	return PRODUCT_1GB_SPACE === camelOrSnakeSlug( product );
}
