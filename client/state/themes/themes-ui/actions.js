/** @format */

/**
 * Internal dependencies
 */
import { THEMES_BANNER_HIDE, THEMES_UPWORK_BANNER_HIDE } from 'state/action-types';

// Hides the theme showcase banner.
export function hideThemesBanner() {
	return {
		type: THEMES_BANNER_HIDE,
	};
}

// Hides the theme showcase banner.
export function hideThemesUpworkBanner() {
	return {
		type: THEMES_UPWORK_BANNER_HIDE,
	};
}
