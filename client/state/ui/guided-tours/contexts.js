/** @ssr-ready **/

import config from 'config';
import { getSectionName, isPreviewShowing, getSelectedSite } from 'state/ui/selectors';
import { isFetchingNextPage, getQueryParams, getThemesList } from 'state/themes/themes-list/selectors';
import { getCurrentUser } from 'state/current-user/selectors';

export const inSection = sectionName => state =>
	getSectionName( state ) === sectionName;

export const isEnabled = feature => () =>
	config.isEnabled( feature );

export const previewIsShowing = state =>
	isPreviewShowing( state );

const WEEK_IN_MILLISECONDS = 7 * 1000 * 3600 * 24;
export const isNewUser = state => {
	const user = getCurrentUser( state );
	if ( ! user ) {
		return false;
	}

	const creation = Date.parse( user.date );
	return ( Date.now() - creation ) <= WEEK_IN_MILLISECONDS;
};

export const selectedSiteIsPreviewable = state =>
	getSelectedSite( state ) && getSelectedSite( state ).is_previewable;

export const selectedSiteIsCustomizable = state =>
	getSelectedSite( state ) && getSelectedSite( state ).is_customizable;

// Themes
export const themeSearchResultsFound = state => {
	const params = getQueryParams( state );
	return params && params.search && params.search.length && ! isFetchingNextPage( state ) && getThemesList( state ).length > 0;
};

export const themeFilterChosen = filter => state => {
	const params = getQueryParams( state );
	return params && params.tier === filter;
};
