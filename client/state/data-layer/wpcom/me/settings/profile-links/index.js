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
import { mergeHandlers } from 'state/action-watchers/utils';
import { USER_PROFILE_LINKS_REQUEST } from 'state/action-types';
import { receiveUserProfileLinks } from 'state/profile-links/actions';
import { newHandler } from './new';
import { deleteHandler } from './delete';

/**
 * Dispatches a request to fetch profile links of the current user
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
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
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @param   {Array}    data     Response from the endpoint
 * @returns {Object} Dispatched user profile links receive action
 */
export const handleRequestSuccess = ( { dispatch }, action, { profile_links } ) =>
	dispatch( receiveUserProfileLinks( profile_links ) );

const requestHandler = {
	[ USER_PROFILE_LINKS_REQUEST ]: [
		dispatchRequestEx( {
			fetch: requestUserProfileLinks,
			onSuccess: handleRequestSuccess,
			onError: noop,
		} ),
	],
};

export default mergeHandlers( requestHandler, newHandler, deleteHandler );
