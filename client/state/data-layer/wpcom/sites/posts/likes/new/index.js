/** @format */

/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import { unlike, addLiker } from 'state/posts/likes/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { POST_LIKE } from 'state/action-types';
import { bypassDataLayer } from 'state/data-layer/utils';

export const fetch = action =>
	http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/posts/${ action.postId }/likes/new`,
			body: {},
			apiVersion: '1.1',
		},
		action
	);

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
