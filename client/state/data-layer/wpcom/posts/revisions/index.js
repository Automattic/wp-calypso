/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { POST_REVISIONS_REQUEST } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receivePostRevisions } from 'state/posts/revisions/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Dispatches returned post revisions
 *
 * @param {object} action Redux action
 * @param {string} action.siteId of the revisions
 * @param {string} action.postId of the revisions
 * @param {object} response from the server
 * @param {object} response.diffs raw data containing a set of diffs for the site & post
 *
 * @returns {Array} An array of Redux actions
 */
export const receiveSuccess = ( { siteId, postId }, response ) =>
	receivePostRevisions( { siteId, postId, ...response } );

/**
 * Dispatches a request to fetch post revisions
 *
 * @param {object} action Redux action
 * @returns {object} Redux action
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
