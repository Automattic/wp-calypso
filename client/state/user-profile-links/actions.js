/** @format */

/**
 * Internal dependencies
 */
import {
	USER_PROFILE_LINKS_ADD,
	USER_PROFILE_LINKS_ADD_DUPLICATE,
	USER_PROFILE_LINKS_ADD_FAILURE,
	USER_PROFILE_LINKS_ADD_MALFORMED,
	USER_PROFILE_LINKS_ADD_SUCCESS,
	USER_PROFILE_LINKS_RECEIVE,
	USER_PROFILE_LINKS_REQUEST,
	USER_PROFILE_LINKS_RESET_ERRORS,
} from 'state/action-types';

/**
 * Returns an action object to signal the request of the user's profile links.
 *
 * @returns {Object} Action object
 */
export const requestUserProfileLinks = () => ( { type: USER_PROFILE_LINKS_REQUEST } );

/**
 * Returns an action object to signal the addition of user profile links.
 *
 * @param  {Array}  profileLinks Array containing the profile links of the current user.
 * @return {Object}              Action object
 */
export const receiveUserProfileLinks = profileLinks => ( {
	type: USER_PROFILE_LINKS_RECEIVE,
	profileLinks,
} );

/**
 * Returns an action object to signal a request for addition of user profile links.
 *
 * @param  {Array}  profileLinks Array containing the new profile links.
 * @return {Object}              Action object
 */
export const addUserProfileLinks = profileLinks => ( {
	type: USER_PROFILE_LINKS_ADD,
	profileLinks,
} );

/**
 * Returns an action object to signal that adding user profile links was successful.
 *
 * @param  {Array}  profileLinks Array containing the new profile links.
 * @return {Object}              Action object
 */
export const addUserProfileLinksSuccess = profileLinks => ( {
	type: USER_PROFILE_LINKS_ADD_SUCCESS,
	profileLinks,
} );

/**
 * Returns an action object to signal that adding user profile links was not successful.
 *
 * @param  {Array}  profileLinks Array containing the profile links from the request.
 * @return {Object}              Action object
 */
export const addUserProfileLinksError = ( profileLinks, error ) => ( {
	type: USER_PROFILE_LINKS_ADD_FAILURE,
	profileLinks,
	error,
} );

/**
 * Returns an action object to signal that some user profile links are duplicate, thus were not added.
 *
 * @param  {Array}  profileLinks Array containing the duplicate profile links.
 * @return {Object}              Action object
 */
export const addUserProfileLinksDuplicate = profileLinks => ( {
	type: USER_PROFILE_LINKS_ADD_DUPLICATE,
	profileLinks,
} );

/**
 * Returns an action object to signal that some user profile links are malformed, thus were not added.
 *
 * @param  {Array}  profileLinks Array containing the malformed profile links.
 * @return {Object}              Action object
 */
export const addUserProfileLinksMalformed = profileLinks => ( {
	type: USER_PROFILE_LINKS_ADD_MALFORMED,
	profileLinks,
} );

/**
 * Returns an action object to signal cleanup of all user profile links errors.
 *
 * @return {Object} Action object
 */
export const resetUserProfileLinkErrors = () => ( {
	type: USER_PROFILE_LINKS_RESET_ERRORS,
} );
