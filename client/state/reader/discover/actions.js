/**
 * External dependencies
 */
 import pickBy from 'lodash/pickBy'

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
import { receivePosts } from 'state/reader/posts/actions';

const discoverBlogId = config( 'discover_blog_id' );

export function receiveDiscoverPosts( discoverPosts ) {
	return {
		type: READER_DISCOVER_POSTS_RECEIVE,
		discoverPosts
	};
}
export function requestDiscoverPosts( number = 10, before, after ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_DISCOVER_POSTS_REQUEST,
		} );

		const query = {
			meta: 'post,discover_original_post',
			orderBy: 'date',
			site: discoverBlogId,
			number,
			before,
			after
		};

		wpcom.undocumented()
				.readSitePosts( pickBy( query ) )
					.then( ( { found, posts } ) => {
						dispatch( receivePosts( posts ) );
						dispatch( receiveDiscoverPosts( posts ) );
						dispatch( {
							type: READER_DISCOVER_POSTS_REQUEST_SUCCESS,
							query,
							found,
							posts
						} );
					} )
					.catch( ( error ) => {
						dispatch( {
							type: READER_DISCOVER_POSTS_REQUEST_FAILURE,
							query,
							error
						} );
					} );
	};
}
