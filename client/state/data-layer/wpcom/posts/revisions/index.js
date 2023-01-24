import { POST_REVISIONS_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { receivePostRevisions } from 'calypso/state/posts/revisions/actions';

const noop = () => {};

/**
 * Dispatches returned post revisions
 *
 * @param {Object} action Redux action
 * @param {string} action.siteId of the revisions
 * @param {string} action.postId of the revisions
 * @param {Object} response from the server
 * @param {Object} response.diffs raw data containing a set of diffs for the site & post
 * @returns {Array} An array of Redux actions
 */
export const receiveSuccess = ( { siteId, postId }, response ) =>
	receivePostRevisions( { siteId, postId, ...response } );

/**
 * Dispatches a request to fetch post revisions
 *
 * @param {Object} action Redux action
 * @returns {Object} Redux action
 */
export const fetchPostRevisionsDiffs = ( action ) => {
	const { siteId, postId, postType, comparisons } = action;
	return http(
		{
			apiVersion: '1.2',
			path: `/sites/${ siteId }/${ postType }/${ postId }/diffs`,
			method: 'GET',
			query: { comparisons },
		},
		action
	);
};

const dispatchPostRevisionsDiffsRequest = dispatchRequest( {
	fetch: fetchPostRevisionsDiffs,
	onSuccess: receiveSuccess,
	onError: noop,
} );

registerHandlers( 'state/data-layer/wpcom/posts/revisions/index.js', {
	[ POST_REVISIONS_REQUEST ]: [ dispatchPostRevisionsDiffsRequest ],
} );
