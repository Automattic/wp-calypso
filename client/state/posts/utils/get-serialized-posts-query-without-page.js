import { omit } from 'lodash';
import { getSerializedPostsQuery } from 'calypso/state/posts/utils/get-serialized-posts-query';

/**
 * Returns a serialized posts query, excluding any page parameter
 *
 * @param  {Object} query  Posts query
 * @param  {number} siteId Optional site ID
 * @returns {string}        Serialized posts query
 */
export function getSerializedPostsQueryWithoutPage( query, siteId ) {
	return getSerializedPostsQuery( omit( query, 'page' ), siteId );
}
