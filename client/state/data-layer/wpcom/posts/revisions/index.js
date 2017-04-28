/**
 * External dependencies
 */
import { flow, map, omit, uniq } from 'lodash';
import mapKeys from 'lodash/fp/mapKeys';
import mapValues from 'lodash/fp/mapValues';
import pick from 'lodash/fp/pick';

/**
 * Internal dependencies
 */
import {
	POST_REVISIONS_REQUEST,
} from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	receivePostRevisions,
	receivePostRevisionsSuccess,
	receivePostRevisionsFailure,
} from 'state/posts/revisions/actions';
import {
	requestUsers,
} from 'state/users/actions';

/**
 * Normalize a WP REST API Post Revisions ressource for consumption in Calypso
 *
 * @param {Object} revision Raw revision from the API
 * @returns {Object} the normalized revision
 */
export function normalizeRevision( revision ) {
	if ( ! revision ) {
		return revision;
	}

	return {
		...omit( revision, [ 'title', 'content', 'excerpt', 'date', 'date_gmt', 'modified', 'modified_gmt' ] ),
		...flow(
			pick( [ 'title', 'content', 'excerpt' ] ),
			mapValues( ( val = {} ) => val.rendered )
		)( revision ),
		...flow(
			pick( [ 'date_gmt', 'modified_gmt' ] ),
			mapValues( val => `${ val }Z` ),
			mapKeys( key => key.slice( 0, -'_gmt'.length ) )
		)( revision )
	};
}

/**
 * Dispatches returned error from post revisions request
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 * @param {String} action.siteId of the revisions
 * @param {String} action.postId of the revisions
 * @param {Function} next dispatches to next middleware in chain
 * @param {Object} rawError from HTTP request
 * @returns {Object} the dispatched action
 */
export const receiveError = ( { dispatch }, { siteId, postId }, next, rawError ) =>
	dispatch( receivePostRevisionsFailure( siteId, postId, rawError ) );

/**
 * Dispatches returned post revisions
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 * @param {String} action.siteId of the revisions
 * @param {String} action.postId of the revisions
 * @param {Function} next dispatches to next middleware in chain
 * @param {Array} revisions raw data from post revisions API
 */
export const receiveSuccess = ( { dispatch }, { siteId, postId }, next, revisions ) => {
	const normalizedRevisions = map( revisions, normalizeRevision );

	dispatch( receivePostRevisionsSuccess( siteId, postId ) );
	dispatch( receivePostRevisions( siteId, postId, normalizedRevisions ) );
	dispatch( requestUsers( siteId, uniq( map( normalizedRevisions, 'author' ) ) ) );
};

/**
 * Dispatches a request to fetch post revisions
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 */
export const fetchPostRevisions = ( { dispatch }, action ) => {
	const { siteId, postId } = action;
	dispatch( http( {
		path: `/sites/${ siteId }/posts/${ postId }/revisions`,
		method: 'GET',
		query: {
			apiNamespace: 'wp/v2',
		},
	}, action ) );
};

const dispatchPostRevisionsRequest = dispatchRequest( fetchPostRevisions, receiveSuccess, receiveError );

export default {
	[ POST_REVISIONS_REQUEST ]: [ dispatchPostRevisionsRequest ]
};
