/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getUser } from 'state/users/selectors';

/**
 * Returns the current user ID
 *
 * @param  {Object}  state  Global state tree
 * @return {?Number}        Current user ID
 */
export function getCurrentUserId( state ) {
	return get( state, [ 'currentUser', 'id' ] );
}

/**
 * Returns the user object for the current user.
 *
 * @param  {Object}  state  Global state tree
 * @return {?Object}        Current user
 */
export function getCurrentUser( state ) {
	const userId = getCurrentUserId( state );
	if ( ! userId ) {
		return null;
	}

	return getUser( state, userId );
}

/**
 * Returns a selector that fetches a property from the current user object
 * @param {String} path Path to the property in the user object
 * @param {?Any} otherwise A default value that is returned if no user or property is found
 * @returns {function} A selector which takes the state as a parameter
 */
export const createCurrentUserSelector = ( path, otherwise = null ) => state => {
	const user = getCurrentUser( state );
	return get( user, path, otherwise );
};

/**
 * Returns the locale slug for the current user.
 *
 * @param  {Object}  state  Global state tree
 * @return {?String}        Current user locale
 */
export const getCurrentUserLocale = createCurrentUserSelector( 'localeSlug' );

/**
 * Returns the number of sites for the current user.
 *
 * @param  {Object}  state  Global state tree
 * @return {?Number}        Current user site count
 */
export function getCurrentUserSiteCount( state ) {
	const user = getCurrentUser( state );
	if ( ! user ) {
		return null;
	}

	return user.site_count || 0;
}

/**
 * Returns the currency code for the current user.
 *
 * @param  {Object}  state  Global state tree
 * @return {?String}        Current currency code
 */
export function getCurrentUserCurrencyCode( state ) {
	return state.currentUser.currencyCode;
}

/**
 * Returns the date (of registration) for the current user.
 *
 * @param  {Object}  state  Global state tree
 * @return {?String}        Date of registration for user
 */
export const getCurrentUserDate = createCurrentUserSelector( 'date' );

/**
 *  Returns the primary email of the current user.
 *
 *  @param {Object} state Global state tree
 *  @returns {?String} The primary email of the current user.
 */
export const getCurrentUserEmail = createCurrentUserSelector( 'email' );

/**
 * Returns true if the capability name is valid for the current user on a given
 * site, false if capabilities are known for the site but the name is invalid,
 * or null if capabilities are not known for the site.
 *
 * @param  {Object}   state      Global state tree
 * @param  {Number}   siteId     Site ID
 * @param  {String}   capability Capability name
 * @return {?Boolean}            Whether capability name is valid
 */
export function isValidCapability( state, siteId, capability ) {
	const capabilities = state.currentUser.capabilities[ siteId ];
	if ( ! capabilities ) {
		return null;
	}

	return capabilities.hasOwnProperty( capability );
}

/**
 * Returns true if the specified flag is enabled for the user
 * @param  {Object}   state      Global state tree
 * @param {String}    flagName   Flag name
 * @returns {boolean}            Whether the flag is enabled for the user
 */
export function currentUserHasFlag( state, flagName ) {
	return state.currentUser.flags.indexOf( flagName ) !== -1;
}

/**
 * Returns true if the current user is email-verified.
 *
 * @param   {Object } state Global state tree
 * @returns {boolean}       Whether the current user is email-verified.
 */
export const isCurrentUserEmailVerified = createCurrentUserSelector( 'email_verified', false );
