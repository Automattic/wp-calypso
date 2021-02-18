/**
 * Internal dependencies
 */
import { getNormalizedPostsQuery } from 'calypso/state/posts/utils/get-normalized-posts-query';

/**
 * Returns a serialized posts query
 *
 * @param  {object} query  Posts query
 * @param  {number} siteId Optional site ID
 * @returns {string}        Serialized posts query
 */
export function getSerializedPostsQuery( query = {}, siteId ) {
	const normalizedQuery = getNormalizedPostsQuery( query );
	const serializedQuery = JSON.stringify( normalizedQuery );

	if ( siteId ) {
		return [ siteId, serializedQuery ].join( ':' );
	}

	return serializedQuery;
}
