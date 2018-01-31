/**
 * External Dependencies
 *
 * @format
 */
import { noop } from 'lodash';

/**
 * Internal Dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import newLike from './new';
import mine from './mine';
import { POST_LIKES_REQUEST } from 'state/action-types';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveLikes } from 'state/posts/likes/actions';

const fetch = action =>
	http( {
		method: 'GET',
		path: `/sites/${ action.siteId }/posts/${ action.postId }/likes`,
	} );

export const fromApi = data => ( {
	found: +data.found,
	iLike: !! data.i_like,
	likes: data.likes,
} );

const onSuccess = ( { siteId, postId }, data ) => receiveLikes( siteId, postId, data );

export default mergeHandlers( newLike, mine, {
	[ POST_LIKES_REQUEST ]: [
		dispatchRequestEx( {
			fetch,
			fromApi,
			onSuccess,
			onError: noop,
		} ),
	],
} );
