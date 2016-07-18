/**
 * External dependencies
 */
import { isEmpty, isObject, map, mapValues, mergeWith, omit, omitBy, reduce } from 'lodash';

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

/**
 * Merges objects like Lodash `merge` but takes array values directly from the
 * source object rather than attempting to merge by index.  Used to ensure that
 * edits to post terms (especially term removals) are reflected correctly.
 *
 * @param  {Object}    object  Destination object for merge
 * @param  {...Object} sources Source objects for merge
 * @return {Object}            Merged object with values from all sources
 */
export function mergeIgnoringArrays( object, ...sources ) {
	return mergeWith( object, ...sources, ( objValue, srcValue ) => {
		if ( Array.isArray( srcValue ) ) {
			return srcValue;
		}
	} );
}

/**
 * Takes existing term post edits and updates the `terms_by_id` attribute
 *
 * @param  {Object}    post  object of post edits
 * @return {Object}          normalized post edits
 */
export function getTermIdsFromEdits( post ) {
	if ( ! post || ! post.terms ) {
		return post;
	}

	// Skip "default" taxonomies until legacy token-field and category-selector are removed
	let taxonomies = omit( post.terms, [ 'post_tag', 'category' ] );

	// Filter taxonomies that are set as arrays ( i.e. tags )
	// This can be detected by an array of strings vs an array of objects
	taxonomies = reduce( taxonomies, ( prev, taxonomyTerms, taxonomyName ) => {
		// Ensures we are working with an array
		const termsArray = map( taxonomyTerms );
		if ( termsArray && termsArray.length && ! isObject( termsArray[ 0 ] ) ) {
			return prev;
		}

		prev[ taxonomyName ] = termsArray;
		return prev;
	}, {} );

	if ( isEmpty( taxonomies ) ) {
		return post;
	}

	post.terms_by_id = mapValues( taxonomies, ( taxonomy ) => {
		const termIds = map( taxonomy, 'ID' );

		// Hack: qs omits empty arrays in wpcom.js request, which prevents
		// removing all terms for a given taxonomy since the empty array is not sent to the API
		return termIds.length ? termIds : null;
	} );

	return post;
}
