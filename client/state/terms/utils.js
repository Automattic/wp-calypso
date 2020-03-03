/**
 * External dependencies
 */

import { omit, omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import { DEFAULT_TERMS_QUERY } from './constants';

/**
 * Returns a normalized terms query, excluding any values which match the
 * default terms query.
 *
 * @param  {object} query Posts query
 * @returns {object}       Normalized terms query
 */
export function getNormalizedTermsQuery( query ) {
	return omitBy( query, ( value, key ) => DEFAULT_TERMS_QUERY[ key ] === value );
}

/**
 * Returns a serialized terms query, used as the key in the
 * `state.terms.queries` state object.
 *
 * @param  {object} query    Terms query
 * @returns {string}          Serialized terms query
 */
export function getSerializedTermsQuery( query = {} ) {
	const normalizedQuery = getNormalizedTermsQuery( query );
	return JSON.stringify( normalizedQuery ).toLocaleLowerCase();
}

/**
 * Returns a serialized terms query, excluding any page parameter
 *
 * @param  {object} query  Terms query
 * @param  {number} siteId Optional site ID
 * @returns {string}        Serialized terms query
 */
export function getSerializedTermsQueryWithoutPage( query ) {
	return getSerializedTermsQuery( omit( query, 'page' ) );
}
