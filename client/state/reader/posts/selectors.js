/** @format */
/**
 * External dependencies
 */
import { filter, keyBy } from 'lodash';

/**
 * Internal depedencies
 */
import treeSelect from 'lib/tree-select';
import { isFeedItem } from 'lib/feed-stream-store/post-key';

/**
 * Returns a single post.
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  postGlobalId Post global ID
 * @return {Object} Post
 */
export function getPostById( state, postGlobalId ) {
	return state.reader.posts.items[ postGlobalId ];
}

const key = ( id, postId ) => `${ id }-${ postId }`;

const getPostMapByFeed = treeSelect(
	state => [ state.reader.posts.items ],
	( [ posts ] ) => {
		const feedPosts = filter( posts, post => post.feed_ID && post.feed_item_ID );
		return keyBy( feedPosts, post => key( post.feed_ID, post.feed_item_ID ) );
	}
);

export const getPostByFeedAndId = treeSelect(
	state => [ getPostMapByFeed( state ) ],
	( [ postMap ], feedId, postId ) => {
		return postMap[ key( feedId, postId ) ];
	}
);

const getPostMapBySite = treeSelect(
	state => [ state.reader.posts.items ],
	( [ posts ] ) => {
		const blogPosts = filter( posts, post => post.site_ID && post.ID );
		return keyBy( blogPosts, post => key( post.site_ID, post.ID ) );
	}
);

export const getPostBySiteAndId = treeSelect(
	state => [ getPostMapBySite( state ) ],
	( [ postMap ], siteId, postId ) => postMap[ key( siteId, postId ) ]
);

export const getPostByKey = ( state, postKey ) => {
	if ( ! postKey ) {
		return null;
	}

	if ( isFeedItem( postKey ) ) {
		return getPostByFeedAndId( state, postKey.feedId, postKey.postId );
	}
	return getPostBySiteAndId( state, postKey.siteId, postKey.postId );
};
