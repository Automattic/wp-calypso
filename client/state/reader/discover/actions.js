/**
 * Internal dependencies
 */
import config from 'config';
import wpcom from 'lib/wp';
import {
	READER_DISCOVER_POSTS_RECEIVE,
	READER_DISCOVER_POSTS_REQUEST,
	READER_DISCOVER_POSTS_REQUEST_FAILURE,
	READER_DISCOVER_POSTS_REQUEST_SUCCESS
} from 'state/action-types';

const discoverBlogId = config( 'discover_blog_id' );

export function receiveDiscoverPosts( discoverPosts ) {
	return {
		type: READER_DISCOVER_POSTS_RECEIVE,
		discoverPosts
	};
}
export function requestDiscoverPosts( originalPostId, limit = 20 ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_DISCOVER_POSTS_REQUEST,
		} );

		const
			source = wpcom.site( discoverBlogId ),
			query = {
				meta: 'site,post',
				origin_site_id: discoverBlogId,
				origin_post_id: originalPostId,
				number: limit
			};

		return source.postsList( query ).then( ( { found, posts } ) => {
			dispatch( receiveDiscoverPosts( posts ) );
			dispatch( {
				type: READER_DISCOVER_POSTS_REQUEST_SUCCESS,
				query,
				found,
				posts
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: READER_DISCOVER_POSTS_REQUEST_FAILURE,
				query,
				error
			} );
		} );
	};
}
