import treeSelect from '@automattic/tree-select';
import { some, get } from 'lodash';
import { keyToString, keyForPost } from 'calypso/reader/post-key';
import 'calypso/state/reader/init';

/**
 * Returns a single post.
 * @param  {Object}  state  Global state tree
 * @param  {string}  postGlobalId Post global ID
 * @returns {Object} Post
 */
export function getPostById( state, postGlobalId ) {
	return state.reader.posts.items[ postGlobalId ];
}

const getPostMapByPostKey = treeSelect(
	( state ) => [ state.reader.posts.items ],
	( [ posts ] ) => {
		const postMap = {};

		Object.values( posts ).forEach( ( post ) => {
			const { feed_item_IDs = [] } = post ?? {};

			// Default case when the post matches only one feed_item_ID, if available.
			if ( feed_item_IDs.length <= 1 ) {
				postMap[ keyToString( keyForPost( post ) ) ] = post;
				return;
			}

			// Edge case when the post matches multiple feed_item_IDs.
			// Insert one entry per feed_item_ID to the post map.
			// See: https://github.com/Automattic/wp-calypso/pull/88408
			feed_item_IDs.forEach( ( feed_item_ID ) => {
				const postKey = keyForPost( { feed_ID: post.feed_ID, feed_item_ID } );
				postMap[ keyToString( postKey ) ] = post;
			} );
		} );

		return postMap;
	}
);

export const getPostByKey = ( state, postKey ) => {
	if ( ! postKey || ! keyToString( postKey ) ) {
		return null;
	}

	const postMap = getPostMapByPostKey( state );
	return postMap[ keyToString( postKey ) ];
};

export const getPostsByKeys = treeSelect(
	( state ) => [ getPostMapByPostKey( state ) ],
	( [ postMap ], postKeys ) => {
		if ( ! postKeys || some( postKeys, ( postKey ) => ! keyToString( postKey ) ) ) {
			return null;
		}
		return postKeys.map( keyToString ).map( ( key ) => postMap[ key ] );
	},
	{ getCacheKey: ( postKeys ) => postKeys.map( keyToString ).join() }
);

export const hasPostBeenSeen = ( state, globalId ) =>
	!! get( state, [ 'reader', 'posts', 'seen', globalId ] );
