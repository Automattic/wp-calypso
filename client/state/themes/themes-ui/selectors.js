import { getLocaleSlug } from 'i18n-calypso';
import { includes } from 'lodash';
import { isStaticFilter, constructThemeShowcaseUrl } from 'calypso/my-sites/themes/helpers';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import 'calypso/state/themes/init';

// Returns destination for theme sheet 'back' button
export function getBackPath( state ) {
	const backPath = state.themes.themesUI.backPath;
	const siteSlug = getSelectedSiteSlug( state );
	const queryArgs = getCurrentQueryArguments( state );

	if ( ! siteSlug || includes( backPath, siteSlug ) ) {
		return backPath;
	}

	if ( queryArgs?.tab_filter || queryArgs?.tier_filter ) {
		const tabFilterType = isStaticFilter( queryArgs?.tab_filter ) ? 'category' : 'filter';
		return constructThemeShowcaseUrl( {
			isLoggedIn: isUserLoggedIn( state ),
			locale: getLocaleSlug(),
			siteSlug,
			tier: queryArgs?.tier_filter,
			[ tabFilterType ]: queryArgs?.tab_filter,
		} );
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
