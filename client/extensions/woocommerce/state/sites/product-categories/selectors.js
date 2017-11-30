/** @format */

/**
 * External dependencies
 */

import { get, isArray, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSerializedProductCategoriesQuery } from './utils';

/**
 * @param {Object} state Whole Redux state tree
 * @param {Object} [query] Query used to fetch product categories. If not provided, API defaults are used.
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether product categories have been successfully loaded from the server
 */
export const areProductCategoriesLoaded = ( state, query, siteId = getSelectedSiteId( state ) ) => {
	const serializedQuery = getSerializedProductCategoriesQuery( query );
	const cats = get(
		state,
		[
			'extensions',
			'woocommerce',
			'sites',
			siteId,
			'productCategories',
			'queries',
			serializedQuery,
		],
		false
	);
	return isArray( cats );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Object} [query] Query used to fetch product categories. If not provided, API defaults are used.
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether product categories are currently being retrieved from the server
 */
export const areProductCategoriesLoading = (
	state,
	query = {},
	siteId = getSelectedSiteId( state )
) => {
	const serializedQuery = getSerializedProductCategoriesQuery( query );
	const isLoading = get( state, [
		'extensions',
		'woocommerce',
		'sites',
		siteId,
		'productCategories',
		'isQueryLoading',
		serializedQuery,
	] );
	// Strict check because it could also be undefined.
	return true === isLoading;
};

/**
 * Gets product categories from API data.
 *
 * @param {Object} rootState Global state tree
 * @param {Object} [query] Query used to fetch product categories. If not provided, API defaults are used.
 * @param {Number} [siteId] wpcom site id, if not provided, uses the selected site id.
 * @return {Array} List of product categories
 */
export const getProductCategories = (
	rootState,
	query = {},
	siteId = getSelectedSiteId( rootState )
) => {
	if ( ! areProductCategoriesLoaded( rootState, query, siteId ) ) {
		return [];
	}
	const serializedQuery = getSerializedProductCategoriesQuery( query );
	const cats = get(
		rootState,
		[ 'extensions', 'woocommerce', 'sites', siteId, 'productCategories', 'items' ],
		{}
	);
	const idsForQuery = get(
		rootState,
		[
			'extensions',
			'woocommerce',
			'sites',
			siteId,
			'productCategories',
			'queries',
			serializedQuery,
		],
		[]
	);

	if ( idsForQuery.length ) {
		return idsForQuery.map( id => cats[ id ] );
	}
	return false;
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Object} [query] Query used to fetch product categories. If not provided, API defaults are used.
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number} Total number of product categories available for a query, or 0 if not loaded yet.
 */
export const getTotalProductCategories = (
	state,
	query = {},
	siteId = getSelectedSiteId( state )
) => {
	const serializedQuery = getSerializedProductCategoriesQuery( omit( query, 'page' ) );
	return get(
		state,
		[ 'extensions', 'woocommerce', 'sites', siteId, 'productCategories', 'total', serializedQuery ],
		0
	);
};

/**
 * Gets product category fetched from API data.
 *
 * @param {Object} rootState Global state tree
 * @param {Number} categoryId The id of the category sought
 * @param {Number} siteId wpcom site id
 * @return {Object|null} Product category if found, otherwise null.
 */
export function getProductCategory(
	rootState,
	categoryId,
	siteId = getSelectedSiteId( rootState )
) {
	return get(
		rootState,
		[ 'extensions', 'woocommerce', 'sites', siteId, 'productCategories', 'items', categoryId ],
		null
	);
}
