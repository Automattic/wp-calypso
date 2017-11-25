/** @format */

/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { USER_PROFILE_LINKS_REQUEST } from 'state/action-types';
import { userProfileLinksReceive } from 'state/user-profile-links/actions';

/**
 * Dispatches a request to fetch profile links of the current user
 *
 * @param   {Function} dispatch Redux dispatcher
 * @returns {Object} Dispatched http action
 */
export const requestUserProfileLinks = ( { dispatch }, action ) =>
	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'GET',
				path: '/me/settings/profile-links',
			},
			action
		)
	);

/**
 * Dispatches a user profile links receive action when the request succeeded.
 *
 * @param   {Function} dispatch     Redux dispatcher
 * @param   {Object}   action       Redux action
 * @param   {Array}    data	        Array of user profile links returned from the endpoint
 * @returns {Object} Dispatched user profile links receive action
 */
export const handleRequestSuccess = ( { dispatch }, action, { profile_links } ) =>
	dispatch( userProfileLinksReceive( profile_links ) );

export default {
	[ USER_PROFILE_LINKS_REQUEST ]: [
		dispatchRequest( requestUserProfileLinks, handleRequestSuccess, noop ),
	],
};
