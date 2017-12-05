/** @format */

/**
 * External dependencies
 */

import { omitBy } from 'lodash';

// Defaults from https://woocommerce.github.io/woocommerce-rest-api-docs/#list-all-product-categories
export const DEFAULT_QUERY = {
	page: 1,
	per_page: 10,
	search: '',
};

/**
 * Returns a normalized product categories query, excluding any values which match the
 * default query.
 *
 * @param  {Object} query Product categories query
 * @return {Object}       Normalized query
 */
export function getNormalizedProductCategoriesQuery( query ) {
	return omitBy( query, ( value, key ) => DEFAULT_QUERY[ key ] === value );
}

/**
 * Returns a serialized product categories query
 *
 * @param  {Object} query  Product categories query
 * @return {String}        Serialized query
 */
export function getSerializedProductCategoriesQuery( query = {} ) {
	const normalizedQuery = getNormalizedProductCategoriesQuery( query );
	const serializedQuery = JSON.stringify( normalizedQuery );

	return serializedQuery;
}
