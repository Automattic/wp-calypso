/** @format */

/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import { like, updateLikeCount } from 'state/posts/likes/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { POST_UNLIKE } from 'state/action-types';
import { bypassDataLayer } from 'state/data-layer/utils';

export function fromApi( response ) {
	return {
		success: !! response.success,
		likeCount: +response.like_count,
	};
}

export default {
	[ POST_UNLIKE ]: [
		dispatchRequestEx( {
			fetch: action =>
				http(
					{
						method: 'POST',
						path: `/sites/${ action.siteId }/posts/${ action.postId }/likes/new`,
						body: {},
					},
					action
				),
			onSuccess: ( { siteId, postId }, { likeCount } ) =>
				updateLikeCount( siteId, postId, likeCount ),
			onError: ( { siteId, postId } ) => bypassDataLayer( like( siteId, postId ) ),
			fromApi,
		} ),
	],
};
