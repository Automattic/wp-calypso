/** @format */

/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import { unlike, updateLikeCount } from 'state/posts/likes/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { POST_LIKE } from 'state/action-types';
import { bypassDataLayer } from 'state/data-layer/utils';

const fetch = action =>
	http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/posts/${ action.postId }/likes/new`,
			body: {},
		},
		action
	);

const onSuccess = ( { siteId, postId }, { likeCount } ) =>
	updateLikeCount( siteId, postId, likeCount );

const onError = ( { siteId, postId } ) => bypassDataLayer( unlike( siteId, postId ) );

export function fromApi( response ) {
	return {
		success: !! response.success,
		likeCount: +response.like_count,
	};
}

export default {
	[ POST_LIKE ]: [
		dispatchRequestEx( {
			fetch,
			onSuccess,
			onError,
			fromApi,
		} ),
	],
};
