/**
 * External dependencies
 */
import { last } from 'lodash';

/**
 * Internal dependencies
 */
import { sameXPost } from 'reader/stream/utils';

/**
 * Add the post URL from a duplicate x-post to an existing post key
 *
 * @param {object} postKey1 First post key
 * @param {object} postKey2 Second (duplicate) post key
 * @returns {object} Post key
 */
export const addDuplicateXPostToPostKey = ( postKey1, postKey2 ) => {
	return {
		...postKey1,
		// Add the URL from the second post key
		xPostUrls: Array.isArray( postKey1.xPostUrls )
			? [ ...postKey1.xPostUrls, postKey2.url ]
			: [ postKey2.url ],
	};
};

/**
 * Combine adjacent x-posts that refer to the same original post
 *
 * @param {Array} postKeys Array of post key objects
 * @returns {Array} Array of post key objects
 */
export const combineXPosts = ( postKeys ) =>
	postKeys.reduce( ( accumulator, postKey ) => {
		const lastPostKey = last( accumulator );
		if ( sameXPost( lastPostKey, postKey ) ) {
			accumulator[ accumulator.length - 1 ] = addDuplicateXPostToPostKey( lastPostKey, postKey );
		} else {
			accumulator.push( postKey );
		}
		return accumulator;
	}, [] );
