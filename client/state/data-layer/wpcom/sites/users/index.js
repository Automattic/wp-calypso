/** @format */

/**
 * External dependencies
 */

import { get, isUndefined, map, noop, omit, omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import { USERS_REQUEST } from 'state/action-types';
import { dispatchRequestEx, getHeaders } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveUsers } from 'state/users/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const DEFAULT_PER_PAGE = 10;

/**
 * Normalize a WP REST API (v2) user ressource for consumption in Calypso which
 * uses legacy API (v1) names internally.
 *
 * @param {Object} user Raw user from the API
 * @returns {Object} the normalized user
 */
export const normalizeUser = user =>
	omitBy(
		{
			ID: user.id,
			display_name: user.name,
			username: user.slug,
		},
		isUndefined
	);

/**
 * Dispatches a request to fetch post revisions users
 *
 * @param {Object} action The `USERS_REQUEST` action used to trigger the fetch
 * @returns {Object} The low-level action used to execute the fetch
 */
export const fetchUsers = action => {
	const { siteId, ids, page = 1, perPage = DEFAULT_PER_PAGE } = action;
	return http(
		{
			path: `/sites/${ siteId }/users`,
			method: 'GET',
			apiNamespace: 'wp/v2',
			query: {
				include: ids,
				page,
				per_page: perPage,
			},
		},
		action
	);
};

/**
 * Dispatches returned users
 *
 * @param {Object} action The `USERS_REQUEST` action with response data as meta
 * @param {Array} users raw data from post revisions API
 * @returns {Object|Function} Action or action thunk that handles the response
 */
export const receiveSuccess = ( action, users ) => dispatch => {
	// receive users from response into Redux state
	const normalizedUsers = map( users, normalizeUser );
	dispatch( receiveUsers( normalizedUsers ) );

	// issue request for next page if needed
	const { page = 1, perPage = DEFAULT_PER_PAGE } = action;
	if ( get( getHeaders( action ), 'X-WP-TotalPages', 0 ) > page ) {
		dispatch(
			fetchUsers( {
				...omit( action, 'meta' ),
				page: page + 1,
				perPage,
			} )
		);
	}
};

const dispatchUsersRequest = dispatchRequestEx( {
	fetch: fetchUsers,
	onSuccess: receiveSuccess,
	onError: noop,
} );

registerHandlers( 'state/data-layer/wpcom/sites/users/index.js', {
	[ USERS_REQUEST ]: [ dispatchUsersRequest ],
} );
