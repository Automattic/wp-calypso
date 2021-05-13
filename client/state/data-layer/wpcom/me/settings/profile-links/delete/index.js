/**
 * Internal dependencies
 */
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { USER_PROFILE_LINKS_DELETE } from 'calypso/state/action-types';
import {
	deleteUserProfileLinkError,
	deleteUserProfileLinkSuccess,
} from 'calypso/state/profile-links/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

import 'calypso/state/profile-links/init';

/**
 * Dispatches a request to delete a profile link for the current user
 *
 * @param   {object} action Redux action
 * @returns {object} Dispatched http action
 */
export const deleteUserProfileLink = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: '/me/settings/profile-links/' + action.linkSlug + '/delete',
		},
		action
	);

/**
 * Dispatches a user profile links deletion success action when the request succeeded.
 *
 * @param   {object} action          Redux action
 * @param   {string} action.linkSlug Slug of the link
 * @returns {object} Dispatched user profile links delete success action
 */
export const handleDeleteSuccess = ( { linkSlug } ) => deleteUserProfileLinkSuccess( linkSlug );

/**
 * Dispatches a user profile links deletion error action when the request failed.
 *
 * @param   {object} action          Redux action
 * @param   {string} action.linkSlug Slug of the link
 * @param   {object} error           Error returned
 * @returns {object} Dispatched user profile links delete error action
 */
export const handleDeleteError = ( { linkSlug }, error ) =>
	deleteUserProfileLinkError( linkSlug, error );

registerHandlers( 'state/data-layer/wpcom/me/settings/profile-links/delete/index.js', {
	[ USER_PROFILE_LINKS_DELETE ]: [
		dispatchRequest( {
			fetch: deleteUserProfileLink,
			onSuccess: handleDeleteSuccess,
			onError: handleDeleteError,
		} ),
	],
} );
