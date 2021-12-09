import { filter, map } from 'lodash';
import wpcom from 'calypso/lib/wp';
import readerContentWidth from 'calypso/reader/lib/content-width';
import {
	READER_RELATED_POSTS_REQUEST,
	READER_RELATED_POSTS_REQUEST_SUCCESS,
	READER_RELATED_POSTS_REQUEST_FAILURE,
	READER_RELATED_POSTS_RECEIVE,
	READER_SITE_UPDATE,
} from 'calypso/state/reader/action-types';
import { receivePosts } from 'calypso/state/reader/posts/actions';
import { SCOPE_ALL, SCOPE_SAME, SCOPE_OTHER } from './utils';

import 'calypso/state/reader/init';

export function requestRelatedPosts( siteId, postId, scope = SCOPE_ALL ) {
	return function ( dispatch ) {
		dispatch( {
			type: READER_RELATED_POSTS_REQUEST,
			payload: {
				siteId,
				postId,
				scope,
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
			query.size_local = 2;
			query.size_global = 0;
		} else if ( scope === SCOPE_OTHER ) {
			query.size_local = 0;
			query.size_global = 2;
		}

		return wpcom.req.get( `/read/site/${ siteId }/post/${ postId }/related`, query ).then(
			( response ) => {
				dispatch( {
					type: READER_RELATED_POSTS_REQUEST_SUCCESS,
					payload: { siteId, postId, scope },
				} );
				const sites = filter( map( response && response.posts, 'meta.data.site' ), Boolean );
				if ( sites && sites.length !== 0 ) {
					dispatch( {
						type: READER_SITE_UPDATE,
						payload: sites,
					} );
				}
				// collect posts and dispatch
				dispatch( receivePosts( response && response.posts ) ).then( () => {
					dispatch( {
						type: READER_RELATED_POSTS_RECEIVE,
						payload: {
							siteId,
							postId,
							scope,
							posts: ( response && response.posts ) || [],
						},
					} );
				} );
			},
			( err ) => {
				dispatch( {
					type: READER_RELATED_POSTS_REQUEST_FAILURE,
					payload: { siteId, postId, scope, error: err },
					error: true,
				} );

				dispatch( {
					type: READER_RELATED_POSTS_RECEIVE,
					payload: {
						siteId,
						postId,
						scope,
						posts: [],
					},
				} );
			}
		);
	};
}
