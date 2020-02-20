/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteSlug } from 'state/ui/selectors';

import 'state/themes/init';

// Returns destination for theme sheet 'back' button
export function getBackPath( state ) {
	const backPath = state.themes.themesUI.backPath;
	const siteSlug = getSelectedSiteSlug( state );

	if ( ! siteSlug || includes( backPath, siteSlug ) ) {
		return backPath;
	}
	return `/themes/${ siteSlug }`;
}

//  Returns true if the theme showcase banner is currently visible
export function isThemesBannerVisible( state ) {
	return state.themes.themesUI.themesBannerVisible;
}

// Returns the theme bookmark.
export function getThemesBookmark( state ) {
	return state.themes.themesUI.themesBookmark;
}

// Returns whether the showcase has opened.
export function hasShowcaseOpened( state ) {
	return state.themes.themesUI.themesShowcaseOpen;
}
