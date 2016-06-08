/**
 * External Dependencies
 */
import filter from 'lodash/filter';
import map from 'lodash/map';

/**
 * Internal Dependencies
 */
import {
	READER_RELATED_POSTS_REQUEST,
	READER_RELATED_POSTS_REQUEST_SUCCESS,
	READER_RELATED_POSTS_REQUEST_FAILURE,
	READER_RELATED_POSTS_RECEIVE,
	READER_SITE_UPDATE
} from 'state/action-types';
import {
	receivePosts
} from 'state/reader/posts/actions';
import wpcom from 'lib/wp';

export function requestRelatedPosts( siteId, postId ) {
	return function( dispatch ) {
		dispatch( {
			type: READER_RELATED_POSTS_REQUEST,
			payload: {
				siteId,
				postId
			}
		} );

		return wpcom.undocumented().readSitePostRelated( { site_id: siteId, post_id: postId, meta: 'site' } ).then(
			response => {
				dispatch( {
					type: READER_RELATED_POSTS_REQUEST_SUCCESS,
					payload: { siteId, postId }
				} );
				const sites = filter( map( response && response.posts, 'meta.data.site' ), Boolean );
				if ( sites && sites.length !== 0 ) {
					dispatch( {
						type: READER_SITE_UPDATE,
						payload: sites
					} );
				}
				// collect posts and dispatch
				dispatch( receivePosts( response && response.posts ) ).then( () => {
					dispatch( {
						type: READER_RELATED_POSTS_RECEIVE,
						payload: {
							siteId,
							postId,
							posts: response && response.posts
						}
					} );
				} );
			},
			err => {
				dispatch( {
					type: READER_RELATED_POSTS_REQUEST_FAILURE,
					payload: { siteId, postId, error: err },
					error: true
				} );
			}
		);
	};
}
