/** @format */

/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { USER_PROFILE_LINKS_REQUEST } from 'state/action-types';
import { receiveUserProfileLinks } from 'state/profile-links/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Dispatches a request to fetch profile links of the current user
 *
 * @param   {Object} action Redux action
 * @returns {Object} Dispatched http action
 */
export const requestUserProfileLinks = action =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: '/me/settings/profile-links',
		},
		action
	);

/**
 * Dispatches a user profile links receive action when the request succeeded.
 *
 * @param   {Object} action Redux action
 * @param   {Array}  data   Response from the endpoint
 * @returns {Object} Dispatched user profile links receive action
 */
export const handleRequestSuccess = ( action, { profile_links } ) =>
	receiveUserProfileLinks( profile_links );

registerHandlers( 'state/data-layer/wpcom/me/settings/profile-links/index.js', {
	[ USER_PROFILE_LINKS_REQUEST ]: [
		dispatchRequestEx( {
			fetch: requestUserProfileLinks,
			onSuccess: handleRequestSuccess,
			onError: noop,
		} ),
	],
} );
