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
 * @param  {object}  state  Global state tree
 * @returns {?number}        Current user ID
 */
export function getCurrentUserId( state ) {
	return get( state, [ 'currentUser', 'id' ] );
}

/**
 * Is the current user logged in?
 *
 * @param {object} state Global state tree
 * @returns {boolean}	True if logged in, False if not
 */
export function isUserLoggedIn( state ) {
	return getCurrentUserId( state ) !== null;
}

/**
 * Returns the user object for the current user.
 *
 * @param  {object}  state  Global state tree
 * @returns {?object}        Current user
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
 *
 * @param {string} path Path to the property in the user object
 * @param {?Any} otherwise A default value that is returned if no user or property is found
 * @returns {Function} A selector which takes the state as a parameter
 */
export const createCurrentUserSelector = ( path, otherwise = null ) => ( state ) => {
	const user = getCurrentUser( state );
	return get( user, path, otherwise );
};

/**
 * Returns the locale slug for the current user.
 *
 * @param  {object}  state  Global state tree
 * @returns {?string}        Current user locale
 */
export const getCurrentUserLocale = createCurrentUserSelector( 'localeSlug' );

/**
 * Returns the locale variant slug for the current user.
 *
 * @param  {object}  state  Global state tree
 * @returns {?string}        Current user locale variant
 */
export const getCurrentUserLocaleVariant = createCurrentUserSelector( 'localeVariant' );

/**
 * Returns the country code for the current user.
 *
 * @param  {object}  state  Global state tree
 * @returns {?string}        Current user country code
 */
export const getCurrentUserCountryCode = createCurrentUserSelector( 'user_ip_country_code' );

/**
 * Returns the number of sites for the current user.
 *
 * @param  {object}  state  Global state tree
 * @returns {?number}        Current user site count
 */
export function getCurrentUserSiteCount( state ) {
	const user = getCurrentUser( state );
	if ( ! user ) {
		return null;
	}

	return user.site_count || 0;
}

/**
 * Returns the number of visible sites for the current user.
 *
 * @param  {object}  state  Global state tree
 * @returns {?number}        Current user visible site count
 */
export function getCurrentUserVisibleSiteCount( state ) {
	const user = getCurrentUser( state );
	if ( ! user ) {
		return null;
	}

	return user.visible_site_count || 0;
}

/**
 * Returns the currency code for the current user.
 *
 * @param  {object}  state  Global state tree
 * @returns {?string}        Current currency code
 */
export function getCurrentUserCurrencyCode( state ) {
	return state.currentUser.currencyCode;
}

/**
 * Returns the date (of registration) for the current user.
 *
 * @param  {object}  state  Global state tree
 * @returns {?string}        Date of registration for user
 */
export const getCurrentUserDate = createCurrentUserSelector( 'date' );

/**
 *  Returns the username of the current user.
 *
 *  @param {object} state Global state tree
 *  @returns {?string} The username of the current user.
 */
export const getCurrentUserName = createCurrentUserSelector( 'username' );

/**
 *  Returns the primary email of the current user.
 *
 *  @param {object} state Global state tree
 *  @returns {?string} The primary email of the current user.
 */
export const getCurrentUserEmail = createCurrentUserSelector( 'email' );

/**
 * Returns true if the capability name is valid for the current user on a given
 * site, false if capabilities are known for the site but the name is invalid,
 * or null if capabilities are not known for the site.
 *
 * @param  {object}   state      Global state tree
 * @param  {number}   siteId     Site ID
 * @param  {string}   capability Capability name
 * @returns {?boolean}            Whether capability name is valid
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
 *
 * @param  {object}   state      Global state tree
 * @param {string}    flagName   Flag name
 * @returns {boolean}            Whether the flag is enabled for the user
 */
export function currentUserHasFlag( state, flagName ) {
	return state.currentUser.flags.indexOf( flagName ) !== -1;
}

/**
 * Returns true if the current user is email-verified.
 *
 * @param   {object } state Global state tree
 * @returns {boolean}       Whether the current user is email-verified.
 */
export const isCurrentUserEmailVerified = createCurrentUserSelector( 'email_verified', false );

/**
 * Returns the Lasagna JWT for the current user.
 *
 * @param  {object}  state  Global state tree
 * @returns {?string}       Lasagna JWT
 */
export function getCurrentUserLasagnaJwt( state ) {
	return state.currentUser.lasagnaJwt;
}
