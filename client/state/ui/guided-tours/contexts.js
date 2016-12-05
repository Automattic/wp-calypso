/**
 * Internal dependencies
 */
import config from 'config';
import { getSectionName, isPreviewShowing as isPreviewShowingSelector, getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getLastAction } from 'state/ui/action-log/selectors';
import { getCurrentUser, canCurrentUser } from 'state/current-user/selectors';
import { hasDefaultSiteTitle } from 'state/sites/selectors';

export const inSection = sectionName => state =>
	getSectionName( state ) === sectionName;

export const isEnabled = feature => () =>
	config.isEnabled( feature );

export const isPreviewNotShowing = state =>
	! isPreviewShowingSelector( state );

export const isPreviewShowing = state =>
	isPreviewShowingSelector( state );

const WEEK_IN_MILLISECONDS = 7 * 1000 * 3600 * 24;
export const isNewUser = state => {
	const user = getCurrentUser( state );
	if ( ! user ) {
		return false;
	}

	const creation = Date.parse( user.date );
	return ( Date.now() - creation ) <= WEEK_IN_MILLISECONDS;
};

export const userIsOlderThan = age => state => {
	const user = getCurrentUser( state );
	if ( ! user ) {
		return false;
	}

	const creation = Date.parse( user.date );
	return ( Date.now() - creation ) >= age;
};

export const hasUserInteractedWithComponent = componentName => state =>
	getLastAction( state ).component === componentName;

export const isSelectedSitePreviewable = state =>
	getSelectedSite( state ) && getSelectedSite( state ).is_previewable;

export const isSelectedSiteCustomizable = state =>
	getSelectedSite( state ) && getSelectedSite( state ).is_customizable;

export const isAbTestInVariant = ( testName, variant ) => () =>
	abtest( testName ) === variant;

export const selectedSiteHasDefaultSiteTitle = state => {
	const siteId = getSelectedSiteId( state );
	return siteId ? hasDefaultSiteTitle( state, siteId ) : false;
};

export const userCanEditSettingsOfSelectedSite = state => {
	const siteId = getSelectedSiteId( state );
	return siteId ? canCurrentUser( state, siteId, 'manage_options' ) : false;
};
