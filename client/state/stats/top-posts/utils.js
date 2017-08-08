/**
 * External dependencies
 */
import { omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import { DEFAULT_TOP_POSTS_QUERY } from './constants';

/**
 * Returns a normalized top posts query, excluding any values which match the
 * default top posts query.
 *
 * @param  {Object} query Top posts query
 * @return {Object}       Normalized top posts query
 */
export function getNormalizedTopPostsQuery( query ) {
	return omitBy( query, ( value, key ) => DEFAULT_TOP_POSTS_QUERY[ key ] === value );
}

/**
 * Returns a serialized top posts query
 *
 * @param  {Object} query  Top posts query
 * @param  {Number} siteId Optional site ID
 * @return {String}        Serialized posts query
 */
export function getSerializedTopPostsQuery( query = {}, siteId ) {
	const normalizedQuery = getNormalizedTopPostsQuery( query );
	const serializedQuery = JSON.stringify( normalizedQuery );

	if ( siteId ) {
		return `${ siteId }:${ serializedQuery }`;
	}

	return serializedQuery;
}
