/**
 * External dependencies
 */
import omitBy from 'lodash/omitBy';
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
import { DEFAULT_TERMS_QUERY } from './constants';

/**
 * Returns a normalized terms query, excluding any values which match the
 * default terms query.
 *
 * @param  {Object} query Posts query
 * @return {Object}       Normalized terms query
 */
export function getNormalizedTermsQuery( query ) {
	return omitBy( query, ( value, key ) => DEFAULT_TERMS_QUERY[ key ] === value );
}

/**
 * Returns a serialized terms query, used as the key in the
 * `state.terms.queries` state object.
 *
 * @param  {Object} query    Terms query
 * @return {String}          Serialized terms query
 */
export function getSerializedTermsQuery( query = {} ) {
	const normalizedQuery = getNormalizedTermsQuery( query );
	return JSON.stringify( normalizedQuery ).toLocaleLowerCase();
}

/**
 * Returns a serialized terms query, excluding any page parameter, used as the
 * key in the `state.terms.queriesLastPage` state object.
 *
 * @param  {Object} query  Terms query
 * @return {String}        Serialized terms query
 */
export function getSerializedTermsQueryWithoutPage( query ) {
	return getSerializedTermsQuery( omit( query, 'page' ) );
}
