/** @format */

/**
 * Internal dependencies
 */
import { THEMES_BANNER_HIDE } from 'state/action-types';

// Hides the theme showcase banner.
export function hideThemesBanner() {
	return {
		type: THEMES_BANNER_HIDE,
	};
}
