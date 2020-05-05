/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import { unlike, addLiker } from 'state/posts/likes/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { POST_LIKE } from 'state/action-types';
import { bypassDataLayer } from 'state/data-layer/utils';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const fetch = ( action ) => {
	const query = {};
	if ( action.source ) {
		query.source = action.source;
	}

	return http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/posts/${ action.postId }/likes/new`,
			body: {},
			apiVersion: '1.1',
			query,
		},
		action
	);
};

export const onSuccess = ( { siteId, postId }, { likeCount, liker } ) =>
	addLiker( siteId, postId, likeCount, liker );

export const onError = ( { siteId, postId } ) => bypassDataLayer( unlike( siteId, postId ) );

export function fromApi( response ) {
	if ( ! response.success ) {
		throw new Error( 'Unsuccessful like API call' );
	}
	return {
		likeCount: +response.like_count,
		liker: response.liker,
	};
}

registerHandlers( 'state/data-layer/wpcom/sites/posts/likes/new/index.js', {
	[ POST_LIKE ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
			fromApi,
		} ),
	],
} );

export default {};
