import wpcom from 'calypso/lib/wp';
import readerContentWidth from 'calypso/reader/lib/content-width';
import {
	READER_RELATED_POSTS_REQUEST,
	READER_RELATED_POSTS_REQUEST_SUCCESS,
	READER_RELATED_POSTS_REQUEST_FAILURE,
	READER_RELATED_POSTS_RECEIVE,
} from 'calypso/state/reader/action-types';
import { receivePosts } from 'calypso/state/reader/posts/actions';
import { SCOPE_ALL, SCOPE_SAME, SCOPE_OTHER } from './utils';

import 'calypso/state/reader/init';

export function requestRelatedPosts( siteId, postId, scope = SCOPE_ALL, size = 2 ) {
	return function ( dispatch ) {
		dispatch( {
			type: READER_RELATED_POSTS_REQUEST,
			payload: {
				siteId,
				postId,
				scope,
				size,
			},
		} );

		const query = {
			apiVersion: '1.2',
			meta: 'site',
		};

		const contentWidth = readerContentWidth();
		if ( contentWidth ) {
			query.content_width = contentWidth;
		}

		if ( scope === SCOPE_SAME ) {
			query.size_local = size;
			query.size_global = 0;
		} else if ( scope === SCOPE_OTHER ) {
			query.size_local = 0;
			query.size_global = size;
		}

		return wpcom.req.get( `/read/site/${ siteId }/post/${ postId }/related`, query ).then(
			( response ) => {
				dispatch( {
					type: READER_RELATED_POSTS_REQUEST_SUCCESS,
					payload: { siteId, postId, scope, size },
				} );

				// collect posts and dispatch
				dispatch( receivePosts( response && response.posts ) ).then( () => {
					dispatch( {
						type: READER_RELATED_POSTS_RECEIVE,
						payload: {
							siteId,
							postId,
							scope,
							size,
							posts: ( response && response.posts ) || [],
						},
					} );
				} );
			},
			( err ) => {
				dispatch( {
					type: READER_RELATED_POSTS_REQUEST_FAILURE,
					payload: { siteId, postId, scope, size, error: err },
					error: true,
				} );

				dispatch( {
					type: READER_RELATED_POSTS_RECEIVE,
					payload: {
						siteId,
						postId,
						scope,
						size,
						posts: [],
					},
				} );
			}
		);
	};
}
