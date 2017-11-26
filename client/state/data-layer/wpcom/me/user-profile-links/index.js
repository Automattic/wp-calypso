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
import { USER_PROFILE_LINKS_ADD, USER_PROFILE_LINKS_REQUEST } from 'state/action-types';
import {
	addUserProfileLinksDuplicate,
	addUserProfileLinksError,
	addUserProfileLinksMalformed,
	addUserProfileLinksSuccess,
	receiveUserProfileLinks,
} from 'state/user-profile-links/actions';

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
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @param   {Array}    data     Response from the endpoint
 * @returns {Object} Dispatched user profile links receive action
 */
export const handleRequestSuccess = ( { dispatch }, action, { profile_links } ) =>
	dispatch( receiveUserProfileLinks( profile_links ) );

/**
 * Dispatches a request to add profile links for the current user
 *
 * @param   {Function} dispatch Redux dispatcher
 * @returns {Object} Dispatched http action
 */
export const addUserProfileLinks = ( { dispatch }, action ) =>
	dispatch(
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
		)
	);

/**
 * Dispatches a user profile links add success and receive actions and when the request succeeded.
 * This will also cover some specific error cases:
 * - duplicate links
 * - malformed links
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @param   {Array}    data     Response from the endpoint
 * @returns {Object} Dispatched user profile links add action
 */
export const handleAddSuccess = ( { dispatch }, action, data ) => {
	dispatch( addUserProfileLinksSuccess( data.profile_links ) );

	if ( data.duplicate ) {
		return dispatch( addUserProfileLinksDuplicate( data.duplicate ) );
	}

	if ( data.malformed ) {
		return dispatch( addUserProfileLinksMalformed( data.malformed ) );
	}

	return dispatch( receiveUserProfileLinks( data.profile_links ) );
};

/**
 * Dispatches a user profile links add error action when the request failed.
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @param   {Array}    data     Response from the endpoint
 * @returns {Object} Dispatched user profile links add error action
 */
export const handleAddError = ( { dispatch }, { profileLinks }, error ) =>
	dispatch( addUserProfileLinksError( profileLinks, error ) );

export default {
	[ USER_PROFILE_LINKS_REQUEST ]: [
		dispatchRequest( requestUserProfileLinks, handleRequestSuccess, noop ),
	],
	[ USER_PROFILE_LINKS_ADD ]: [
		dispatchRequest( addUserProfileLinks, handleAddSuccess, handleAddError ),
	],
};
