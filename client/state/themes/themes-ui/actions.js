/** @format */

/**
 * Internal dependencies
 */
import { THEMES_BANNER_IS_SHOWING } from 'state/action-types';

// Hides the theme showcase banner.
export function hideThemesBanner() {
	return {
		type: THEMES_BANNER_IS_SHOWING,
		showing: false,
	};
}
