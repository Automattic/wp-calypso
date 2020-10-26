/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { POST_GEO_IMAGE_REQUEST } from 'calypso/state/action-types';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { receivePostGeoImageUrl } from 'calypso/state/posts/geo/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

/**
 * Dispatches returned post revisions
 *
 * @param {object} action Redux action
 * @param {string} action.siteId of the revisions
 * @param {string} action.postId of the revisions
 * @param {object} response from the server
 * @param {string} response.map_url map url for the specific coodinates
 *
 * @returns {Array} An array of Redux actions
 */
export const receiveSuccess = ( { siteId, postId }, response ) =>
	receivePostGeoImageUrl( { siteId, postId, ...response } );

/**
 * Dispatches a request to fetch post geo image.
 *
 * @param {object} action Redux action
 * @returns {object} Redux action
 */
export const fetchPostGeoImageUrl = ( action ) => {
	const { siteId, postId, latitude, longitude } = action;

	const path = postId
		? `/sites/${ siteId }/posts/${ postId }/map-url`
		: `/sites/${ siteId }/posts/map-url`;
	return http(
		{
			apiNamespace: 'wpcom/v2',
			path: path,
			method: 'GET',
			query: { latitude, longitude },
		},
		action
	);
};

const dispatchPostGeoImageRequest = dispatchRequest( {
	fetch: fetchPostGeoImageUrl,
	onSuccess: receiveSuccess,
	onError: noop,
} );

registerHandlers( 'state/data-layer/wpcom/posts/geo/index.js', {
	[ POST_GEO_IMAGE_REQUEST ]: [ dispatchPostGeoImageRequest ],
} );
