/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { USER_PROFILE_LINKS_ADD } from 'state/action-types';
import {
	addUserProfileLinksDuplicate,
	addUserProfileLinksError,
	addUserProfileLinksMalformed,
	addUserProfileLinksSuccess,
	receiveUserProfileLinks,
} from 'state/profile-links/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Dispatches a request to add profile links for the current user
 *
 * @param   {object} action Redux action
 * @returns {object} Dispatched http action
 */
export const addUserProfileLinks = ( action ) =>
	http(
		{
			apiVersion: '1.2',
			method: 'POST',
			path: '/me/settings/profile-links/new',
			body: {
				links: action.profileLinks,
			},
		},
		action
	);

/**
 * Dispatches a user profile links add success and receive actions and when the request succeeded.
 * This will also cover some specific error cases:
 * - duplicate links
 * - malformed links
 *
 * @param   {object} action Redux action
 * @param   {Array}  data   Response from the endpoint
 * @returns {object} Dispatched user profile links add action
 */
export const handleAddSuccess = ( action, data ) => {
	const actions = [ addUserProfileLinksSuccess( action.profileLinks ) ];

	if ( data.duplicate ) {
		actions.push( addUserProfileLinksDuplicate( data.duplicate ) );
	} else if ( data.malformed ) {
		actions.push( addUserProfileLinksMalformed( data.malformed ) );
	} else {
		actions.push( receiveUserProfileLinks( data.profile_links ) );
	}

	return actions;
};

/**
 * Dispatches a user profile links add error action when the request failed.
 *
 * @param   {object} action Redux action
 * @param   {object} error  Error returned
 * @returns {object} Dispatched user profile links add error action
 */
export const handleAddError = ( { profileLinks }, error ) =>
	addUserProfileLinksError( profileLinks, error );

registerHandlers( 'state/data-layer/wpcom/me/settings/profile-links/new/index.js', {
	[ USER_PROFILE_LINKS_ADD ]: [
		dispatchRequest( {
			fetch: addUserProfileLinks,
			onSuccess: handleAddSuccess,
			onError: handleAddError,
		} ),
	],
} );
