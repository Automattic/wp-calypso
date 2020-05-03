/**
 * External dependencies
 */

import { get, isUndefined, map, noop, omit, omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import { POST_REVISIONS_AUTHORS_REQUEST } from 'state/action-types';
import { dispatchRequest, getHeaders } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receivePostRevisionAuthors } from 'state/posts/revisions/authors/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const DEFAULT_PER_PAGE = 10;

/**
 * Normalize a WP REST API (v2) user ressource for consumption in Calypso which
 * uses legacy API (v1) names internally.
 *
 * @param {object} user Raw user from the API
 * @returns {object} the normalized user
 */
export const normalizeUser = ( user ) =>
	omitBy(
		{
			ID: user.id,
			display_name: user.name,
			username: user.slug,
		},
		isUndefined
	);

/**
 * Dispatches a request to fetch post revisions authors
 *
 * @param {object} action The `POST_REVISIONS_AUTHORS_REQUEST` action used to trigger the fetch
 * @returns {object} The low-level action used to execute the fetch
 */
export const fetchPostRevisionAuthors = ( action ) => {
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
 * Dispatches returned post revision authors
 *
 * @param {object} action The `POST_REVISIONS_AUTHORS_REQUEST` action with response data as meta
 * @param {Array} users raw data from post revisions API
 * @returns {object|Function} Action or action thunk that handles the response
 */
export const receivePostRevisionAuthorsSuccess = ( action, users ) => ( dispatch ) => {
	// receive users from response into Redux state
	const normalizedUsers = map( users, normalizeUser );
	dispatch( receivePostRevisionAuthors( normalizedUsers ) );

	// issue request for next page if needed
	const { page = 1, perPage = DEFAULT_PER_PAGE } = action;
	if ( get( getHeaders( action ), 'X-WP-TotalPages', 0 ) > page ) {
		dispatch(
			fetchPostRevisionAuthors( {
				...omit( action, 'meta' ),
				page: page + 1,
				perPage,
			} )
		);
	}
};

const dispatchPostRevisionAuthorsRequest = dispatchRequest( {
	fetch: fetchPostRevisionAuthors,
	onSuccess: receivePostRevisionAuthorsSuccess,
	onError: noop,
} );

registerHandlers( 'state/data-layer/wpcom/sites/users/index.js', {
	[ POST_REVISIONS_AUTHORS_REQUEST ]: [ dispatchPostRevisionAuthorsRequest ],
} );
