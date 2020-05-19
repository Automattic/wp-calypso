/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { ANALYTICS_EVENT_RECORD, EDITOR_PASTE_EVENT } from 'state/action-types';
import { SOURCE_GOOGLE_DOCS } from 'components/tinymce/plugins/wpcom-track-paste/sources';
import config from 'config';
import { abtest } from 'lib/abtest';
import MediaStore from 'lib/media/store';
import { getSectionName, getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getLastAction } from 'state/ui/action-log/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import { hasDefaultSiteTitle, isCurrentPlanPaid, isJetpackSite } from 'state/sites/selectors';

const { getAll: getAllMedia } = MediaStore;

export const WEEK_IN_MILLISECONDS = 7 * 1000 * 3600 * 24;

/**
 * Returns a selector that tests if the current user is in a given section
 *
 * @param {string} sectionName Name of section
 * @returns {Function} Selector function
 */
export const inSection = ( sectionName ) => ( state ) => getSectionName( state ) === sectionName;

/**
 * Returns a selector that tests if a feature is enabled in config
 *
 * @param {string} feature Name of feature
 * @returns {Function} Selector function
 */
export const isEnabled = ( feature ) => () => config.isEnabled( feature );

/**
 * Returns milliseconds since registration date of the current user
 *
 * @param {object} state Global state tree
 * @returns {number|boolean} Milliseconds since registration, false if cannot be determined
 */
const timeSinceUserRegistration = ( state ) => {
	const user = getCurrentUser( state );
	const registrationDate = user && Date.parse( user.date );
	return registrationDate ? Date.now() - registrationDate : false;
};

/**
 * Returns a selector that tests if the user is newer than a given time
 *
 * @param {number} age Number of milliseconds
 * @returns {Function} Selector function
 */
export const isUserNewerThan = ( age ) => ( state ) => {
	const userAge = timeSinceUserRegistration( state );
	return userAge !== false ? userAge <= age : false;
};

/**
 * Returns true if the user is considered "new" (less than a week since registration)
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if user is new, false otherwise
 */
export const isNewUser = ( state ) => {
	return isUserNewerThan( WEEK_IN_MILLISECONDS )( state );
};

/**
 * Returns true if the user is NOT considered "new" (less than a week since registration)
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if user is NOT new, false otherwise
 */
export const isNotNewUser = ( state ) => {
	return ! isNewUser( state );
};

/**
 * Returns a selector that tests if the user is older than a given time
 *
 * @param {number} age Number of milliseconds
 * @returns {Function} Selector function
 */
export const isUserOlderThan = ( age ) => ( state ) => {
	const userAge = timeSinceUserRegistration( state );
	return userAge !== false ? userAge >= age : false;
};

/**
 * Returns a selector that tests if the user has registered before given date
 *
 * @param {Date} date Date of registration
 * @returns {Function} Selector function
 */
export const hasUserRegisteredBefore = ( date ) => ( state ) => {
	const compareDate = date && Date.parse( date );
	const user = getCurrentUser( state );
	const registrationDate = user && Date.parse( user.date );
	return registrationDate < compareDate;
};

/*
 * Deprecated.
 */
export const hasUserInteractedWithComponent = () => () => false;

/**
 * Returns a selector that tests whether a certain analytics event has been
 * fired.
 *
 * @see client/state/analytics
 *
 * @param {string} eventName Name of analytics event
 * @returns {Function} Selector function
 */
export const hasAnalyticsEventFired = ( eventName ) => ( state ) => {
	const last = getLastAction( state );
	return (
		last.type === ANALYTICS_EVENT_RECORD &&
		last.meta.analytics.some( ( record ) => record.payload.name === eventName )
	);
};

/**
 * Returns true if the selected site can be previewed
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if selected site can be previewed, false otherwise.
 */
export const isSelectedSitePreviewable = ( state ) =>
	get( getSelectedSite( state ), 'is_previewable', false );

/**
 * Returns true if the current user can run customizer for the selected site
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if user can run customizer, false otherwise.
 */
export const isSelectedSiteCustomizable = ( state ) =>
	getSelectedSite( state ) && getSelectedSite( state ).is_customizable;

/**
 * Returns true if the selected site has any media files.
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if site has any media files, false otherwise.
 */
export const doesSelectedSiteHaveMediaFiles = ( state ) => {
	const siteId = getSelectedSiteId( state );
	if ( ! siteId ) {
		return false;
	}
	const media = getAllMedia( siteId );
	return media && media.length && media.length > 0;
};

/**
 * Returns a selector that tests whether an A/B test is in a given variant.
 *
 * @see client/lib/abtest
 *
 * @param {string} testName Name of A/B test
 * @param {string} variant Variant identifier
 * @returns {Function} Selector function
 */
export const isAbTestInVariant = ( testName, variant ) => () => abtest( testName ) === variant;

/**
 * Returns true if the selected site has an unchanged site title
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if site title is default, false otherwise.
 */
export const hasSelectedSiteDefaultSiteTitle = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return siteId ? hasDefaultSiteTitle( state, siteId ) : false;
};

/**
 * Returns true if the selected site has a paid plan
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if selected site is on a paid plan, false otherwise.
 */
export const isSelectedSitePlanPaid = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return siteId ? isCurrentPlanPaid( state, siteId ) : false;
};

/**
 * Returns true if the selected site has a free plan.
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if selected site is on a free plan, false otherwise.
 */
export const isSelectedSitePlanFree = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return siteId ? ! isCurrentPlanPaid( state, siteId ) : false;
};

/**
 * Returns true if user has just pasted something from Google Docs.
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if user has just pasted something from Google Docs, false otherwise.
 */
export const hasUserPastedFromGoogleDocs = ( state ) => {
	const action = getLastAction( state ) || false;
	return action && action.type === EDITOR_PASTE_EVENT && action.source === SOURCE_GOOGLE_DOCS;
};

/**
 * Returns true if the current user can edit settings of the selected site.
 * Used in the siteTitle tour.
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if user can edit settings, false otherwise.
 */
export const canUserEditSettingsOfSelectedSite = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return siteId ? canCurrentUser( state, siteId, 'manage_options' ) : false;
};

/**
 * Returns true if the current site is a jetpack site.
 * Used in activity log tours.
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if site is Jetpack, false otherwise.
 */
export const isSelectedSiteJetpack = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return siteId ? isJetpackSite( state, siteId ) : false;
};

/**
 * Returns true if the current site is not a jetpack site.
 * Used in activity log tours.
 *
 * @param {object} state Global state tree
 * @returns {boolean} True is not Jetpack, false otherwise.
 */
export const isSelectedSiteNotJetpack = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return siteId ? ! isJetpackSite( state, siteId ) : false;
};
