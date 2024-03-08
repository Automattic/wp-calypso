import { StyleVariation } from '../types';
import { isDefaultGlobalStylesVariationSlug } from './global-styles';

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
