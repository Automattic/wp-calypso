/** @format */

/**
 * Internal dependencies
 */
import { POST_REVISIONS_REQUEST } from 'state/action-types';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	receivePostRevisions,
	receivePostRevisionsSuccess,
	receivePostRevisionsFailure,
} from 'state/posts/revisions/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Dispatches returned error from post revisions request
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {String} action.siteId of the revisions
 * @param {String} action.postId of the revisions
 * @param {Object} rawError from HTTP request
 *
 * @return {Object} the dispatched action
 */
export const receiveError = ( { siteId, postId }, rawError ) =>
	receivePostRevisionsFailure( siteId, postId, rawError );

/**
 * Dispatches returned post revisions
 *
 * @param {Object} action Redux action
 * @param {String} action.siteId of the revisions
 * @param {String} action.postId of the revisions
 * @param {Object} response from the server
 * @param {Object} response.diffs raw data containing a set of diffs for the site & post
 *
 * @return {Array} An array of Redux actions
 */
export const receiveSuccess = ( { siteId, postId }, response ) => {
	return [
		receivePostRevisionsSuccess( siteId, postId ),
		receivePostRevisions( { siteId, postId, ...response } ),
	];
};

/**
 * Dispatches a request to fetch post revisions
 *
 * @param {Object} action Redux action
 * @return {Object} Redux action
 */
export const fetchPostRevisionsDiffs = action => {
	const { siteId, postId, postType, comparisons } = action;
	return http(
		{
			apiVersion: '1.1',
			path: `/sites/${ siteId }/${ postType }/${ postId }/diffs`,
			method: 'GET',
			query: { comparisons },
		},
		action
	);
};

const dispatchPostRevisionsDiffsRequest = dispatchRequestEx( {
	fetch: fetchPostRevisionsDiffs,
	onSuccess: receiveSuccess,
	onError: receiveError,
} );

registerHandlers( 'state/data-layer/wpcom/posts/revisions/index.js', {
	[ POST_REVISIONS_REQUEST ]: [ dispatchPostRevisionsDiffsRequest ],
} );
