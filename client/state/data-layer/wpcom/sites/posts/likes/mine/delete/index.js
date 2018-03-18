/** @format */

/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import { like, removeLiker } from 'state/posts/likes/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { POST_UNLIKE } from 'state/action-types';
import { bypassDataLayer } from 'state/data-layer/utils';

export function fromApi( response ) {
	if ( ! response.success ) {
		throw new Error( 'Unsuccessful unlike API request' );
	}
	return {
		likeCount: +response.like_count,
		liker: response.liker,
	};
}

export const fetch = action =>
	http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/posts/${ action.postId }/likes/mine/delete`,
			apiVersion: '1.1',
			body: {},
		},
		action
	);

export const onSuccess = ( { siteId, postId }, { likeCount, liker } ) =>
	removeLiker( siteId, postId, likeCount, liker );

export const onError = ( { siteId, postId } ) => bypassDataLayer( like( siteId, postId ) );

export default {
	[ POST_UNLIKE ]: [
		dispatchRequestEx( {
			fetch,
			onSuccess,
			onError,
			fromApi,
		} ),
	],
};
