import { POST_LIKERS_REQUEST, POST_LIKES_REQUEST } from 'calypso/state/action-types';
import { mergeHandlers } from 'calypso/state/action-watchers/utils';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { receiveLikes, receivePostLikers } from 'calypso/state/posts/likes/actions';
import mine from './mine';
import newLike from './new';

export const fetch = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/posts/${ action.postId }/likes`,
			apiVersion: '1.1',
		},
		action
	);

export const fromApi = ( data ) => ( {
	found: +data.found,
	iLike: !! data.i_like,
	likes: data.likes,
} );

export const onLikersSuccess = ( { siteId, postId }, data ) =>
	receivePostLikers( siteId, postId, data );

export const onLikesSuccess = ( { siteId, postId }, data ) => receiveLikes( siteId, postId, data );

registerHandlers(
	'state/data-layer/wpcom/sites/posts/likes/index.js',
	mergeHandlers( newLike, mine, {
		[ POST_LIKERS_REQUEST ]: [
			dispatchRequest( {
				fetch,
				fromApi,
				onSuccess: onLikersSuccess,
				onError: () => {},
			} ),
		],
		[ POST_LIKES_REQUEST ]: [
			dispatchRequest( {
				fetch,
				fromApi,
				onSuccess: onLikesSuccess,
				onError: () => {},
			} ),
		],
	} )
);
