/**
 * Internal dependencies
 */
import config from 'config';
import { abtest } from 'lib/abtest';
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

const timeSinceUserRegistration = state => {
	const user = getCurrentUser( state );
	return user ? ( Date.now() - Date.parse( user.date ) ) : false;
};

const WEEK_IN_MILLISECONDS = 7 * 1000 * 3600 * 24;
export const isNewUser = state => {
	const userAge = timeSinceUserRegistration( state );
	return ! isNaN( userAge ) ? userAge <= WEEK_IN_MILLISECONDS : false;
};

export const isUserOlderThan = age => state => {
	const userAge = timeSinceUserRegistration( state );
	return ! isNaN( userAge ) ? userAge >= age : false;
};

export const hasUserInteractedWithComponent = componentName => state =>
	getLastAction( state ).component === componentName;

export const isSelectedSitePreviewable = state =>
	getSelectedSite( state ) && getSelectedSite( state ).is_previewable;

export const isSelectedSiteCustomizable = state =>
	getSelectedSite( state ) && getSelectedSite( state ).is_customizable;

export const isAbTestInVariant = ( testName, variant ) => () =>
	abtest( testName ) === variant;

export const hasSelectedSiteDefaultSiteTitle = state => {
	const siteId = getSelectedSiteId( state );
	return siteId ? hasDefaultSiteTitle( state, siteId ) : false;
};

export const canUserEditSettingsOfSelectedSite = state => {
	const siteId = getSelectedSiteId( state );
	return siteId ? canCurrentUser( state, siteId, 'manage_options' ) : false;
};
