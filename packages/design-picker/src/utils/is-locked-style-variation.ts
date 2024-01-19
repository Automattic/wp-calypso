import { Design, StyleVariation } from '../types';
import { isDefaultGlobalStylesVariationSlug } from './global-styles';

export function isLockedStyleVariation( {
	design,
	selectedStyleVariation,
	shouldLimitGlobalStyles,
}: {
	design: Design;
	selectedStyleVariation: StyleVariation;
	shouldLimitGlobalStyles: boolean;
} ) {
	return (
		( shouldLimitGlobalStyles &&
			! design.is_premium &&
			! isDefaultGlobalStylesVariationSlug( selectedStyleVariation?.slug ) ) ??
		false
	);
}
