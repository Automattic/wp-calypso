/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import { like, removeLiker } from 'state/posts/likes/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { POST_UNLIKE } from 'state/action-types';
import { bypassDataLayer } from 'state/data-layer/utils';

import { registerHandlers } from 'state/data-layer/handler-registry';

export function fromApi( response ) {
	if ( ! response.success ) {
		throw new Error( 'Unsuccessful unlike API request' );
	}
	return {
		likeCount: +response.like_count,
		liker: response.liker,
	};
}

export const fetch = ( action ) => {
	const query = {};
	if ( action.source ) {
		query.source = action.source;
	}

	return http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/posts/${ action.postId }/likes/mine/delete`,
			apiVersion: '1.1',
			body: {},
			query,
		},
		action
	);
};

export const onSuccess = ( { siteId, postId }, { likeCount, liker } ) =>
	removeLiker( siteId, postId, likeCount, liker );

export const onError = ( { siteId, postId } ) => bypassDataLayer( like( siteId, postId ) );

registerHandlers( 'state/data-layer/wpcom/sites/posts/likes/mine/delete/index.js', {
	[ POST_UNLIKE ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
			fromApi,
		} ),
	],
} );

export default {};
