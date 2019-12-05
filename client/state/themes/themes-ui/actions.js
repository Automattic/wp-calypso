/**
 * Internal dependencies
 */
import {
	THEMES_BANNER_HIDE,
	THEMES_SHOWCASE_OPEN,
	THEMES_BROWSING_STATE_SET,
} from 'state/action-types';

// Hides the theme showcase banner.
export function hideThemesBanner() {
	return {
		type: THEMES_BANNER_HIDE,
	};
}

// Open "More Themes" search area.
export function openThemesShowcase() {
	return {
		type: THEMES_SHOWCASE_OPEN,
	};
}

export function setThemesBookmark( state ) {
	return {
		type: THEMES_BROWSING_STATE_SET,
		payload: state,
	};
}
