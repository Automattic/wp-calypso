/**
 * External dependencies
 */
import { flow, map } from 'lodash';
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
		...revision,
		...flow(
			pick( [ 'title', 'content', 'excerpt' ] ),
			mapValues( ( val = {} ) => val.rendered )
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
	dispatch( receivePostRevisionsSuccess( siteId, postId ) );
	dispatch( receivePostRevisions( siteId, postId, map( revisions, normalizeRevision ) ) );
};

/**
 * Dispatches a request to fetch post revisions
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 * @param {String} action.siteId of the revisions
 * @param {String} action.postId of the revisions
 * @returns {Object} the dispatched action
 */
export const fetchPostRevisions = ( { dispatch }, { siteId, postId } ) =>
	dispatch( http( {
		path: `/sites/${ siteId }/posts/${ postId }/revisions`,
		method: 'GET',
		query: {
			apiNamespace: 'wp/v2',
		},
	} ) );

const dispatchPostRevisionsRequest = dispatchRequest( fetchPostRevisions, receiveSuccess, receiveError );

export default {
	[ POST_REVISIONS_REQUEST ]: [ dispatchPostRevisionsRequest ]
};
