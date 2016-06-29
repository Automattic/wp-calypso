/**
 * Internal dependencies
 */
import { getUser } from 'state/users/selectors';
import get from 'lodash/get';

/**
 * Returns the current user ID
 *
 * @param  {Object}  state  Global state tree
 * @return {?Number}        Current user ID
 */
export function getCurrentUserId( state ) {
	return state.currentUser.id;
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
 * Returns the locale slug for the current user.
 *
 * @param  {Object}  state  Global state tree
 * @return {?String}        Current user locale
 */
export function getCurrentUserLocale( state ) {
	const user = getCurrentUser( state );
	if ( ! user ) {
		return null;
	}

	return user.localeSlug || null;
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
 * Returns true if the current user has the specified capability for the site,
 * false if the user does not have the capability, or null if the capability
 * cannot be determined (if the site is not currently known, or if specifying
 * an invalid capability).
 *
 * @see https://codex.wordpress.org/Function_Reference/current_user_can
 *
 * @param  {Object}   state      Global state tree
 * @param  {Number}   siteId     Site ID
 * @param  {String}   capability Capability label
 * @return {?Boolean}            Whether current user has capability
 */
export function canCurrentUser( state, siteId, capability ) {
	return get( state.currentUser.capabilities, [ siteId, capability ], null );
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
