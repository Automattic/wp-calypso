/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import 'calypso/state/themes/init';

// Returns destination for theme sheet 'back' button
export function getBackPath( state ) {
	const backPath = state.themes.themesUI.backPath;
	const siteSlug = getSelectedSiteSlug( state );

	if ( ! siteSlug || includes( backPath, siteSlug ) ) {
		return backPath;
	}
	return `/themes/${ siteSlug }`;
}

// Returns the theme bookmark.
export function getThemesBookmark( state ) {
	return state.themes.themesUI.themesBookmark;
}

// Returns whether the showcase has opened.
export function hasShowcaseOpened( state ) {
	return state.themes.themesUI.themesShowcaseOpen;
}
