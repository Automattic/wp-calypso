/**
 * Internal dependencies
 */
import { ANALYTICS_EVENT_RECORD, EDITOR_PASTE_EVENT } from 'state/action-types';
import { SOURCE_GOOGLE_DOCS } from 'components/tinymce/plugins/wpcom-track-paste/sources';
import config from 'config';
import { abtest } from 'lib/abtest';
import {
	getSectionName,
	getSelectedSite,
	getSelectedSiteId,
} from 'state/ui/selectors';
import { getLastAction } from 'state/ui/action-log/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { canCurrentUser, isSiteCustomizable } from 'state/selectors';
import {
	hasDefaultSiteTitle,
	isCurrentPlanPaid,
} from 'state/sites/selectors';

const WEEK_IN_MILLISECONDS = 7 * 1000 * 3600 * 24;

/**
 * Returns a selector that tests if the current user is in a given section
 *
 * @param {String} sectionName Name of section
 * @return {Function} Selector function
 */
export const inSection = sectionName => state =>
	getSectionName( state ) === sectionName;

/**
 * Returns a selector that tests if a feature is enabled in config
 *
 * @param {String} feature Name of feature
 * @return {Function} Selector function
 */
export const isEnabled = feature => () =>
	config.isEnabled( feature );

/**
 * Returns milliseconds since registration date of the current user
 *
 * @param {Object} state Global state tree
 * @return {Number|Boolean} Milliseconds since registration, false if cannot be determined
 */
const timeSinceUserRegistration = state => {
	const user = getCurrentUser( state );
	const registrationDate = user && Date.parse( user.date );
	return registrationDate ? ( Date.now() - registrationDate ) : false;
};

/**
 * Returns true if the user is considered "new" (less than a week since registration)
 *
 * @param {Object} state Global state tree
 * @return {Boolean} True if user is new, false otherwise
 */
export const isNewUser = state => {
	const userAge = timeSinceUserRegistration( state );
	return userAge !== false ? userAge <= WEEK_IN_MILLISECONDS : false;
};

/**
 * Returns a selector that tests if the user is older than a given time
 *
 * @param {Number} age Number of milliseconds
 * @return {Function} Selector function
 */
export const isUserOlderThan = age => state => {
	const userAge = timeSinceUserRegistration( state );
	return userAge !== false ? userAge >= age : false;
};

/**
 * Returns a selector that tests if the user has registered before given date
 *
 * @param {Date} date Date of registration
 * @return {Function} Selector function
 */
export const hasUserRegisteredBefore = date => state => {
	const compareDate = date && Date.parse( date );
	const user = getCurrentUser( state );
	const registrationDate = user && Date.parse( user.date );
	return ( registrationDate < compareDate );
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
 * @param {String} eventName Name of analytics event
 * @return {Function} Selector function
 */
export const hasAnalyticsEventFired = eventName => state => {
	const last = getLastAction( state );
	return ( last.type === ANALYTICS_EVENT_RECORD ) &&
		last.meta.analytics.some( record =>
			record.payload.name === eventName );
};

/**
 * Returns true if the selected site can be previewed
 *
 * @param {Object} state Global state tree
 * @return {Boolean} True if selected site can be previewed, false otherwise.
 */
export const isSelectedSitePreviewable = state =>
	getSelectedSite( state ) && getSelectedSite( state ).is_previewable;

/**
 * Returns true if the current user can run customizer for the selected site
 *
 * @param {Object} state Global state tree
 * @return {Boolean} True if user can run customizer, false otherwise.
 */
export const isSelectedSiteCustomizable = state =>
	isSiteCustomizable( state, getSelectedSiteId( state ) );

/**
 * Returns a selector that tests whether an A/B test is in a given variant.
 *
 * @see client/lib/abtest
 *
 * @param {String} testName Name of A/B test
 * @param {String} variant Variant identifier
 * @return {Function} Selector function
 */
export const isAbTestInVariant = ( testName, variant ) => () =>
	abtest( testName ) === variant;

/**
 * Returns true if the selected site has an unchanged site title
 *
 * @param {Object} state Global state tree
 * @return {Boolean} True if site title is default, false otherwise.
 */
export const hasSelectedSiteDefaultSiteTitle = state => {
	const siteId = getSelectedSiteId( state );
	return siteId ? hasDefaultSiteTitle( state, siteId ) : false;
};

/**
 * Returns true if the selected site has a paid plan
 *
 * @param {Object} state Global state tree
 * @return {Boolean} True if selected site is on a paid plan, false otherwise.
 */
export const isSelectedSitePlanPaid = state => {
	const siteId = getSelectedSiteId( state );
	return siteId ? isCurrentPlanPaid( state, siteId ) : false;
};

/**
 * Returns true if user has just pasted something from Google Docs.
 *
 * @param {Object} state Global state tree
 * @return {Boolean} True if user has just pasted something from Google Docs, false otherwise.
 */
export const hasUserPastedFromGoogleDocs = state => {
	const action = getLastAction( state ) || false;
	return action && ( action.type === EDITOR_PASTE_EVENT ) && ( action.source === SOURCE_GOOGLE_DOCS );
};

/**
 * Returns true if the current user can edit settings of the selected site.
 * Used in the siteTitle tour.
 *
 * @param {Object} state Global state tree
 * @return {Boolean} True if user can edit settings, false otherwise.
 */
export const canUserEditSettingsOfSelectedSite = state => {
	const siteId = getSelectedSiteId( state );
	return siteId ? canCurrentUser( state, siteId, 'manage_options' ) : false;
};
