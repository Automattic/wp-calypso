/**
 * External dependencies
 */

import { omitBy } from 'lodash';

// Defaults from https://woocommerce.github.io/woocommerce-rest-api-docs/#list-all-product-categories
export const DEFAULT_QUERY = {
	page: 1,
	per_page: 100,
	search: '',
};

/**
 * Returns a normalized product categories query, excluding any values which match the
 * default query.
 *
 * @param  {object} query Product categories query
 * @returns {object}       Normalized query
 */
export function getNormalizedProductCategoriesQuery( query ) {
	return omitBy( query, ( value, key ) => DEFAULT_QUERY[ key ] === value );
}

/**
 * Returns a serialized product categories query
 *
 * @param  {object} query  Product categories query
 * @returns {string}        Serialized query
 */
export function getSerializedProductCategoriesQuery( query = {} ) {
	const normalizedQuery = getNormalizedProductCategoriesQuery( query );
	const serializedQuery = JSON.stringify( normalizedQuery );

	return serializedQuery;
}
