import { isDefaultGlobalStylesVariationSlug } from './global-styles';
import type { StyleVariation } from '../types';

export function isLockedStyleVariation( {
	isPremiumTheme,
	styleVariationSlug,
	shouldLimitGlobalStyles,
}: {
	isPremiumTheme: boolean;
	styleVariationSlug?: StyleVariation[ 'slug' ];
	shouldLimitGlobalStyles?: boolean;
} ) {
	return (
		( shouldLimitGlobalStyles &&
			! isPremiumTheme &&
			! isDefaultGlobalStylesVariationSlug( styleVariationSlug ) ) ??
		false
	);
}
