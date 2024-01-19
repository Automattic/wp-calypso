import { Design, StyleVariation } from '../types';
import { isDefaultGlobalStylesVariationSlug } from './global-styles';

export function isLockedStyleVariation( {
	isPremium,
	selectedStyleVariationSlug,
	shouldLimitGlobalStyles,
}: {
	isPremium: Design[ 'is_premium' ];
	selectedStyleVariationSlug?: StyleVariation[ 'slug' ];
	shouldLimitGlobalStyles?: boolean;
} ) {
	return (
		( shouldLimitGlobalStyles &&
			! isPremium &&
			! isDefaultGlobalStylesVariationSlug( selectedStyleVariationSlug ) ) ??
		false
	);
}
