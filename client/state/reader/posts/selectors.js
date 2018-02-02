/** @format */
/**
 * External dependencies
 */
import { filter, keyBy } from 'lodash';

/**
 * Internal depedencies
 */
import treeSelect from 'lib/tree-select';

/**
 * Returns a single post.
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  postGlobalId Post global ID
 * @return {Object} Post
 */
export function getPost( state, postGlobalId ) {
	return state.reader.posts.items[ postGlobalId ];
}

const key = ( id, postId ) => `${ id }-${ postId }`;

const getPostMapByFeed = treeSelect(
	state => [ state.reader.posts.items ],
	( [ posts ] ) => keyBy( posts, post => key( post.feed_ID, post.ID ) )
);

export const getPostByFeedAndId = treeSelect(
	state => [ getPostMapByFeed( state ) ],
	( [ postMap ], feedId, postId ) => postMap[ key( feedId, postId ) ]
);

const getPostMapBySite = treeSelect(
	state => [ state.reader.posts.items ],
	( [ posts ] ) => keyBy( posts, post => key( post.site_Id, post.ID ) )
);

export const getPostBySiteAndId = treeSelect(
	state => [ getPostMapBySite( state ) ],
	( [ postMap ], siteId, postId ) => postMap[ key( siteId, postId ) ]
);
