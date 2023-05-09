import { omit, omitBy } from 'lodash';
import { DEFAULT_TERMS_QUERY } from './constants';

/**
 * Returns a normalized terms query, excluding any values which match the
 * default terms query.
 *
 * @param  {Object} query Posts query
 * @returns {Object}       Normalized terms query
 */
export function getNormalizedTermsQuery( query ) {
	return omitBy( query, ( value, key ) => DEFAULT_TERMS_QUERY[ key ] === value );
}

/**
 * Returns a serialized terms query, used as the key in the
 * `state.terms.queries` state object.
 *
 * @param  {Object} query    Terms query
 * @returns {string}          Serialized terms query
 */
export function getSerializedTermsQuery( query = {} ) {
	const normalizedQuery = getNormalizedTermsQuery( query );
	return JSON.stringify( normalizedQuery ).toLocaleLowerCase();
}

/**
 * Returns a serialized terms query, excluding any page parameter
 *
 * @param  {Object} query  Terms query
 * @returns {string}        Serialized terms query
 */
export function getSerializedTermsQueryWithoutPage( query ) {
	return getSerializedTermsQuery( omit( query, 'page' ) );
}
