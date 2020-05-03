/**
 * External dependencies
 */
import { omitBy } from 'lodash';

export const DEFAULT_QUERY = {
	page: 1,
	per_page: 10,
	search: '',
};

/**
 * Returns a normalized products query, excluding any values which match the
 * default product query.
 *
 * @param  {object} query Products query
 * @returns {object}       Normalized products query
 */
export function getNormalizedProductsQuery( query ) {
	return omitBy( query, ( value, key ) => DEFAULT_QUERY[ key ] === value );
}

/**
 * Returns a serialized products query
 *
 * @param  {object} query  Products query
 * @returns {string}        Serialized products query
 */
export function getSerializedProductsQuery( query = {} ) {
	const normalizedQuery = getNormalizedProductsQuery( query );
	const serializedQuery = JSON.stringify( normalizedQuery );

	return serializedQuery;
}
