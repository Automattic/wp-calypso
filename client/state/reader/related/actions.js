/**
 * External Dependencies
 */
import filter from 'lodash/filter';
import map from 'lodash/map';

/**
 * Internal Dependencies
 */
import {
	READER_POSTS_RECEIVE,
	READER_RELATED_POSTS_REQUEST,
	READER_RELATED_POSTS_REQUEST_SUCCESS,
	READER_RELATED_POSTS_REQUEST_FAILURE,
	READER_RELATED_POSTS_RECEIVE,
	READER_SITE_UPDATE
} from 'state/action-types';
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
				// collect posts and dispatch
				dispatch( {
					type: READER_POSTS_RECEIVE,
					posts: response && response.posts
				} );
				const sites = filter( map( response && response.posts, 'meta.data.site' ), Boolean );
				if ( sites ) {
					dispatch( {
						type: READER_SITE_UPDATE,
						payload: sites
					} );
				}
				dispatch( {
					type: READER_RELATED_POSTS_RECEIVE,
					payload: {
						siteId,
						postId,
						posts: response && response.posts
					}
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
