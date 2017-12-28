/** @format */

/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'client/state/data-layer/wpcom-http/utils';
import { http } from 'client/state/data-layer/wpcom-http/actions';
import { USER_PROFILE_LINKS_DELETE } from 'client/state/action-types';
import {
	deleteUserProfileLinkError,
	deleteUserProfileLinkSuccess,
} from 'client/state/profile-links/actions';

/**
 * Dispatches a request to delete a profile link for the current user
 *
 * @param   {Object} action Redux action
 * @returns {Object} Dispatched http action
 */
export const deleteUserProfileLink = action =>
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
 * @param   {Object} action Redux action
 * @returns {Object} Dispatched user profile links delete success action
 */
export const handleDeleteSuccess = ( { linkSlug } ) => deleteUserProfileLinkSuccess( linkSlug );

/**
 * Dispatches a user profile links deletion error action when the request failed.
 *
 * @param   {Object} action Redux action
 * @param   {Object} error  Error returned
 * @returns {Object} Dispatched user profile links delete error action
 */
export const handleDeleteError = ( { linkSlug }, error ) =>
	deleteUserProfileLinkError( linkSlug, error );

export default {
	[ USER_PROFILE_LINKS_DELETE ]: [
		dispatchRequestEx( {
			fetch: deleteUserProfileLink,
			onSuccess: handleDeleteSuccess,
			onError: handleDeleteError,
		} ),
	],
};
