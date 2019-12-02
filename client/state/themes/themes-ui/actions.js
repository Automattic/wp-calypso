/**
 * Internal dependencies
 */
import { THEMES_BANNER_HIDE, THEMES_SHOWCASE_OPEN } from 'state/action-types';

// Hides the theme showcase banner.
export function hideThemesBanner() {
	return {
		type: THEMES_BANNER_HIDE,
	};
}

export function openThemesShowcase() {
	return {
		type: THEMES_SHOWCASE_OPEN,
	};
}
