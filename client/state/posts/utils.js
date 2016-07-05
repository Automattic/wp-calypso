/**
 * External dependencies
 */
import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';

/**
 * Internal dependencies
 */
import { DEFAULT_POST_QUERY } from './constants';

/**
 * Constants
 */

const REGEXP_SERIALIZED_QUERY = /^((\d+):)?(.*)$/;

/**
 * Returns a normalized posts query, excluding any values which match the
 * default post query.
 *
 * @param  {Object} query Posts query
 * @return {Object}       Normalized posts query
 */
export function getNormalizedPostsQuery( query ) {
	return omitBy( query, ( value, key ) => DEFAULT_POST_QUERY[ key ] === value );
}

/**
 * Returns a serialized posts query
 *
 * @param  {Object} query  Posts query
 * @param  {Number} siteId Optional site ID
 * @return {String}        Serialized posts query
 */
export function getSerializedPostsQuery( query = {}, siteId ) {
	const normalizedQuery = getNormalizedPostsQuery( query );
	const serializedQuery = JSON.stringify( normalizedQuery );

	if ( siteId ) {
		return [ siteId, serializedQuery ].join( ':' );
	}

	return serializedQuery;
}

/**
 * Returns an object with details related to the specified serialized query.
 * The object will include siteId and/or query object, if can be parsed.
 *
 * @param  {String} serializedQuery Serialized posts query
 * @return {Object}                 Deserialized posts query details
 */
export function getDeserializedPostsQueryDetails( serializedQuery ) {
	let siteId, query;

	const matches = serializedQuery.match( REGEXP_SERIALIZED_QUERY );
	if ( matches ) {
		siteId = Number( matches[ 2 ] ) || undefined;
		try {
			query = JSON.parse( matches[ 3 ] );
		} catch ( error ) {}
	}

	return { siteId, query };
}

/**
 * Returns a serialized posts query, excluding any page parameter
 *
 * @param  {Object} query  Posts query
 * @param  {Number} siteId Optional site ID
 * @return {String}        Serialized posts query
 */
export function getSerializedPostsQueryWithoutPage( query, siteId ) {
	return getSerializedPostsQuery( omit( query, 'page' ), siteId );
}
