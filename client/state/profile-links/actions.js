/**
 * Internal dependencies
 */
import {
	USER_PROFILE_LINKS_ADD,
	USER_PROFILE_LINKS_ADD_DUPLICATE,
	USER_PROFILE_LINKS_ADD_FAILURE,
	USER_PROFILE_LINKS_ADD_MALFORMED,
	USER_PROFILE_LINKS_ADD_SUCCESS,
	USER_PROFILE_LINKS_DELETE,
	USER_PROFILE_LINKS_DELETE_FAILURE,
	USER_PROFILE_LINKS_DELETE_SUCCESS,
	USER_PROFILE_LINKS_RECEIVE,
	USER_PROFILE_LINKS_REQUEST,
	USER_PROFILE_LINKS_RESET_ERRORS,
} from 'state/action-types';

import 'state/data-layer/wpcom/me/settings/profile-links';
import 'state/data-layer/wpcom/me/settings/profile-links/delete';
import 'state/data-layer/wpcom/me/settings/profile-links/new';

/**
 * Returns an action object to signal the request of the user's profile links.
 *
 * @returns {object} Action object
 */
export const requestUserProfileLinks = () => ( { type: USER_PROFILE_LINKS_REQUEST } );

/**
 * Returns an action object to signal the addition of user profile links.
 *
 * @param  {Array}  profileLinks Array containing the profile links of the current user.
 * @returns {object}              Action object
 */
export const receiveUserProfileLinks = ( profileLinks ) => ( {
	type: USER_PROFILE_LINKS_RECEIVE,
	profileLinks,
} );

/**
 * Returns an action object to signal a request for addition of user profile links.
 *
 * @param  {Array}  profileLinks Array containing the new profile links.
 * @returns {object}              Action object
 */
export const addUserProfileLinks = ( profileLinks ) => ( {
	type: USER_PROFILE_LINKS_ADD,
	profileLinks,
} );

/**
 * Returns an action object to signal that adding user profile links was successful.
 *
 * @param  {Array}  profileLinks Array containing the new profile links.
 * @returns {object}              Action object
 */
export const addUserProfileLinksSuccess = ( profileLinks ) => ( {
	type: USER_PROFILE_LINKS_ADD_SUCCESS,
	profileLinks,
} );

/**
 * Returns an action object to signal that adding user profile links was not successful.
 *
 * @param  {Array}  profileLinks Array containing the profile links from the request.
 * @param  {object} error        Error received
 * @returns {object}              Action object
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
 * @returns {object}              Action object
 */
export const addUserProfileLinksDuplicate = ( profileLinks ) => ( {
	type: USER_PROFILE_LINKS_ADD_DUPLICATE,
	profileLinks,
} );

/**
 * Returns an action object to signal that some user profile links are malformed, thus were not added.
 *
 * @param  {Array}  profileLinks Array containing the malformed profile links.
 * @returns {object}              Action object
 */
export const addUserProfileLinksMalformed = ( profileLinks ) => ( {
	type: USER_PROFILE_LINKS_ADD_MALFORMED,
	profileLinks,
} );

/**
 * Returns an action object to signal cleanup of all user profile links errors.
 *
 * @returns {object} Action object
 */
export const resetUserProfileLinkErrors = () => ( {
	type: USER_PROFILE_LINKS_RESET_ERRORS,
} );

/**
 * Returns an action object to signal a request for the deletion of a user profile link.
 *
 * @param  {string} linkSlug Slug of the user profile link to delete.
 * @returns {object}          Action object
 */
export const deleteUserProfileLink = ( linkSlug ) => ( {
	type: USER_PROFILE_LINKS_DELETE,
	linkSlug,
} );

/**
 * Returns an action object to signal that request for the deletion of a user profile link was successful.
 *
 * @param  {string} linkSlug Slug of the user profile link to delete.
 * @returns {object}          Action object
 */
export const deleteUserProfileLinkSuccess = ( linkSlug ) => ( {
	type: USER_PROFILE_LINKS_DELETE_SUCCESS,
	linkSlug,
} );

/**
 * Returns an action object to signal that request for the deletion of a user profile link was not successful.
 *
 * @param  {string} linkSlug Slug of the user profile link to delete.
 * @param  {object} error    Error received
 * @returns {object}          Action object
 */
export const deleteUserProfileLinkError = ( linkSlug, error ) => ( {
	type: USER_PROFILE_LINKS_DELETE_FAILURE,
	linkSlug,
	error,
} );
