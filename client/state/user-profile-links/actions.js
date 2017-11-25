/** @format */

/**
 * Internal dependencies
 */
import { USER_PROFILE_LINKS_REQUEST, USER_PROFILE_LINKS_RECEIVE } from 'state/action-types';

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
export const userProfileLinksReceive = profileLinks => ( {
	type: USER_PROFILE_LINKS_RECEIVE,
	profileLinks,
} );
