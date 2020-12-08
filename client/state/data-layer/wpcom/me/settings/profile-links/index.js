/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { USER_PROFILE_LINKS_REQUEST } from 'calypso/state/action-types';
import { receiveUserProfileLinks } from 'calypso/state/profile-links/actions';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

/**
 * Dispatches a request to fetch profile links of the current user
 *
 * @param   {object} action Redux action
 * @returns {object} Dispatched http action
 */
export const requestUserProfileLinks = ( action ) =>
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
 * @param   {object} action Redux action
 * @param   {Array}  data   Response from the endpoint
 * @returns {object} Dispatched user profile links receive action
 */
export const handleRequestSuccess = ( action, { profile_links } ) =>
	receiveUserProfileLinks( profile_links );

registerHandlers( 'state/data-layer/wpcom/me/settings/profile-links/index.js', {
	[ USER_PROFILE_LINKS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestUserProfileLinks,
			onSuccess: handleRequestSuccess,
			onError: noop,
		} ),
	],
} );
