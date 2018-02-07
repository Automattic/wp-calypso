/** @format */
/**
 * External dependencies
 */
import { keyBy } from 'lodash';

/**
 * Internal depedencies
 */
import treeSelect from 'lib/tree-select';
import { keyToString, keyForPost } from 'lib/feed-stream-store/post-key';

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

const getPostMapByPostKey = treeSelect(
	state => [ state.reader.posts.items ],
	( [ posts ] ) => keyBy( posts, post => keyToString( keyForPost( post ) ) )
);

export const getPostByKey = ( state, postKey ) => {
	if ( ! postKey ) {
		return null;
	}
	const postMap = getPostMapByPostKey( state );
	return postMap[ keyToString( postKey ) ];
};

export const getPostsByKeys = treeSelect(
	state => [ getPostMapByPostKey( state ) ],
	( [ postMap ], postKeys ) => {
		if ( ! postKeys ) {
			return null;
		}
		return postKeys.map( keyToString ).map( key => postMap[ key ] );
	},
	{ getCacheKey: postKeys => postKeys.map( keyToString ).join() }
);
