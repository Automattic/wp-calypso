/**
 * External dependencies
 */
import { omitBy } from 'lodash';

export const DEFAULT_QUERY = {
	page: 1,
	per_page: 50,
	status: 'any',
};

/**
 * Returns a normalized orders query, excluding any values which match the
 * default order query.
 *
 * @param  {Object} query Orders query
 * @return {Object}       Normalized orders query
 */
export function getNormalizedOrdersQuery( query ) {
	return omitBy( query, ( value, key ) => DEFAULT_QUERY[ key ] === value );
}

/**
 * Returns a serialized orders query
 *
 * @param  {Object} query  Orders query
 * @return {String}        Serialized orders query
 */
export function getSerializedOrdersQuery( query = {} ) {
	const normalizedQuery = getNormalizedOrdersQuery( query );
	const serializedQuery = JSON.stringify( normalizedQuery );

	return serializedQuery;
}
