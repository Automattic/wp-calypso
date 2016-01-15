/**
 * External dependencies
 */
import omit from 'lodash/object/omit';

/**
 * Internal dependencies
 */
import { DEFAULT_POST_QUERY } from './constants';

/**
 * Returns a normalized posts query, excluding any values which match the
 * default post query.
 *
 * @param  {Object} query Posts query
 * @return {Object}       Normalized posts query
 */
export function getNormalizedPostsQuery( query ) {
	return omit( query, ( value, key ) => DEFAULT_POST_QUERY[ key ] === value );
}

/**
 * Returns a serialized posts query, used as the key in the
 * `state.posts.siteQueries` state object.
 *
 * @param  {Object} query Posts query
 * @return {String}       Serialized posts query
 */
export function getSerializedPostsQuery( query = {} ) {
	return JSON.stringify( getNormalizedPostsQuery( query ) ).toLowerCase();
}

/**
 * Returns a serialized posts query, excluding any page parameter, used as the
 * key in the `state.posts.siteQueriesLastPage` state object.
 *
 * @param  {Object} query Posts query
 * @return {String}       Serialized posts query
 */
export function getSerializedPostsQueryWithoutPage( query ) {
	return JSON.stringify( omit( getNormalizedPostsQuery( query ), 'page' ) ).toLowerCase();
}
