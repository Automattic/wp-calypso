/**
 * External dependencies
 */

import { omitBy } from 'lodash';

export const DEFAULT_QUERY = {
	page: 1,
	per_page: 10,
	search: '',
	status: 'pending',
};

/**
 * Returns a normalized reviews query, excluding any values which match the
 * default reviews query.
 *
 * @param  {object} query Reviews query
 * @returns {object}       Normalized reviews query
 */
export function getNormalizedReviewsQuery( query ) {
	return omitBy( query, ( value, key ) => DEFAULT_QUERY[ key ] === value );
}

/**
 * Returns a serialized reviews query
 *
 * @param  {object} query  Reviews query
 * @returns {string}        Serialized reviews query
 */
export function getSerializedReviewsQuery( query = {} ) {
	const normalizedQuery = getNormalizedReviewsQuery( query );
	const serializedQuery = JSON.stringify( normalizedQuery );

	return serializedQuery;
}
