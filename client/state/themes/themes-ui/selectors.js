/**
 * External dependencies
 */

import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteSlug } from 'state/ui/selectors';

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
