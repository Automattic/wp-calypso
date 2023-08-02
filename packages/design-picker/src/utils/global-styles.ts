import { DEFAULT_GLOBAL_STYLES_VARIATION_SLUG } from '../constants';

export function isDefaultGlobalStylesVariationSlug( slug?: string ): boolean {
	return ! slug || slug === DEFAULT_GLOBAL_STYLES_VARIATION_SLUG;
}
