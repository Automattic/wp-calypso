/**
 * Internal dependencies
 */
import config from 'config';
import { abtest } from 'lib/abtest';
import {
	getSectionName,
	getSelectedSite,
	getSelectedSiteId,
} from 'state/ui/selectors';
import { getLastAction } from 'state/ui/action-log/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { canCurrentUser } from 'state/selectors';
import { hasDefaultSiteTitle } from 'state/sites/selectors';

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

/**
 * Returns a selector that tests whether the user has interacted with a given component.
 *
 * @see client/components/track-interactions
 *
 * @param {String} componentName Name of component to test
 * @return {Function} Selector function
 */
export const hasUserInteractedWithComponent = componentName => state =>
	getLastAction( state ).component === componentName;

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
	getSelectedSite( state ) && getSelectedSite( state ).is_customizable;

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
