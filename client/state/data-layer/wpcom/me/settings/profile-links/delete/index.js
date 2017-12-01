/** @format */

/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { USER_PROFILE_LINKS_DELETE } from 'state/action-types';
import {
	deleteUserProfileLinkError,
	deleteUserProfileLinkSuccess,
} from 'state/profile-links/actions';

/**
 * Dispatches a request to delete a profile link for the current user
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @returns {Object} Dispatched http action
 */
export const deleteUserProfileLink = ( { dispatch }, action ) =>
	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'POST',
				path: '/me/settings/profile-links/' + action.linkSlug + '/delete',
			},
			action
		)
	);

/**
 * Dispatches a user profile links deletion success action when the request succeeded.
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @returns {Object} Dispatched user profile links delete success action
 */
export const handleDeleteSuccess = ( { dispatch }, { linkSlug } ) =>
	dispatch( deleteUserProfileLinkSuccess( linkSlug ) );

/**
 * Dispatches a user profile links deletion error action when the request failed.
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @param   {Object}   error    Error returned
 * @returns {Object} Dispatched user profile links delete error action
 */
export const handleDeleteError = ( { dispatch }, { linkSlug }, error ) =>
	dispatch( deleteUserProfileLinkError( linkSlug, error ) );

export default {
	[ USER_PROFILE_LINKS_DELETE ]: [
		dispatchRequestEx( {
			fetch: deleteUserProfileLink,
			onSuccess: handleDeleteSuccess,
			onError: handleDeleteError,
		} ),
	],
};
