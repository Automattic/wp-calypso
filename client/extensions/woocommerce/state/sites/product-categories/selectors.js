/** @format */
/**
 * External dependencies
 */
import { get, isArray, omit, range, values } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSerializedProductCategoriesQuery } from './utils';

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} State tree local to product categories reducer
 */
function getRawCategoryState( state, siteId = getSelectedSiteId( state ) ) {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'productCategories' ], {} );
}

/**
 * @param {Object} state Whole Redux state tree
 * @param {Object} [query] Query used to fetch product categories. If not provided, API defaults are used.
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether product categories have been successfully loaded from the server
 */
export function areProductCategoriesLoaded(
	state,
	query = {},
	siteId = getSelectedSiteId( state )
) {
	const serializedQuery = getSerializedProductCategoriesQuery( query );
	const categoryState = getRawCategoryState( state, siteId );
	const cats = categoryState.queries && categoryState.queries[ serializedQuery ];

	return isArray( cats );
}

/**
 * @param {Object} state Whole Redux state tree
 * @param {Object} [query] Query used to fetch product categories. If not provided, API defaults are used.
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether product categories are currently being retrieved from the server
 */
export function areProductCategoriesLoading(
	state,
	query = {},
	siteId = getSelectedSiteId( state )
) {
	const serializedQuery = getSerializedProductCategoriesQuery( query );
	const categoryState = getRawCategoryState( state, siteId );
	const isLoading = categoryState.isQueryLoading && categoryState.isQueryLoading[ serializedQuery ];
	// Strict check because it could also be undefined.
	return true === isLoading;
}

/**
 * Returns true if currently requesting product categories for a query, excluding all known
 * queried pages, or false otherwise.
 *
 * @param {Object} state Whole Redux state tree
 * @param {Object} [query] Query used to fetch product categories. If not provided, API defaults are used.
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Boolean}       Returns true if currently requesting product categories for a query, excluding all known queried pages.
 */
export function areAnyProductCategoriesLoading(
	state,
	query = {},
	siteId = getSelectedSiteId( state )
) {
	const lastPage = getProductCategoriesLastPage( state, query, siteId );
	if ( null === lastPage ) {
		return false;
	}

	return range( 1, lastPage + 1 ).some( page => {
		const catQuery = { ...query, page };
		return areProductCategoriesLoading( state, catQuery, siteId );
	} );
}

/**
 * Gets product category fetched from API data.
 *
 * @param {Object} state Global state tree
 * @param {Number} categoryId The id of the category sought
 * @param {Number} siteId wpcom site id
 * @return {Object|null} Product category if found, otherwise null.
 */
export function getProductCategory( state, categoryId, siteId = getSelectedSiteId( state ) ) {
	const categoryState = getRawCategoryState( state, siteId );
	const category = categoryState.items && categoryState.items[ categoryId ];
	if ( ! category ) {
		return null;
	}
	const label = getProductCategoryLabel( state, categoryId, siteId );
	return { ...category, label };
}

/**
 * Gets product categories from API data.
 *
 * @param {Object} state Global state tree
 * @param {Object} [query] Query used to fetch product categories. If not provided, API defaults are used.
 * @param {Number} [siteId] wpcom site id, if not provided, uses the selected site id.
 * @return {Array} List of product categories
 */
export function getProductCategories( state, query = {}, siteId = getSelectedSiteId( state ) ) {
	if ( ! areProductCategoriesLoaded( state, query, siteId ) ) {
		return [];
	}
	const serializedQuery = getSerializedProductCategoriesQuery( query );
	const categoryState = getRawCategoryState( state, siteId );
	const idsForQuery = categoryState.queries && categoryState.queries[ serializedQuery ];

	if ( idsForQuery.length ) {
		return idsForQuery.map( id => getProductCategory( state, id, siteId ) );
	}

	return [];
}

/**
 * Gets all product categories from API data for a query, ignoring pages.
 *
 * @param {Object} state Global state tree
 * @param {Object} [query] Query used to fetch product categories. If not provided, API defaults are used.
 * @param {Number} [siteId] wpcom site id, if not provided, uses the selected site id.
 * @return {Array} List of product categories
 */
export function getAllProductCategories( state, query = {}, siteId = getSelectedSiteId( state ) ) {
	const loading = areAnyProductCategoriesLoading( state, query, siteId );
	if ( loading ) {
		return [];
	}

	const lastPage = getProductCategoriesLastPage( state, query, siteId );
	if ( null === lastPage ) {
		return [];
	}

	const categoryState = getRawCategoryState( state, siteId );
	const items = values( categoryState.items ) || [];
	return items.map( cat => getProductCategory( state, cat.id, siteId ) );
}

/**
 * @param {Object} state Whole Redux state tree
 * @param {Object} [query] Query used to fetch product categories. If not provided, API defaults are used.
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number|Null} Total number of pages available for a query, or null if not loaded yet.
 */
export function getProductCategoriesLastPage(
	state,
	query = {},
	siteId = getSelectedSiteId( state )
) {
	const serializedQuery = getSerializedProductCategoriesQuery( omit( query, 'page' ) );
	const categoryState = getRawCategoryState( state, siteId );
	return ( categoryState.totalPages && categoryState.totalPages[ serializedQuery ] ) || null;
}

/**
 * @param {Object} state Whole Redux state tree
 * @param {Object} [query] Query used to fetch product categories. If not provided, API defaults are used.
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number} Total number of product categories available for a query, or 0 if not loaded yet.
 */
export function getTotalProductCategories(
	state,
	query = {},
	siteId = getSelectedSiteId( state )
) {
	const serializedQuery = getSerializedProductCategoriesQuery( omit( query, 'page' ) );
	const categoryState = getRawCategoryState( state, siteId );
	return ( categoryState.total && categoryState.total[ serializedQuery ] ) || 0;
}

/*
 * Get the label for a given product, recursively including parent names.
 *
 * @param {Object} state Global state tree
 * @param {Number} categoryId ID of the starting category.
 * @param {Number} [siteId] wpcom site id, if not provided, uses the selected site id.
 * @return {String} Label of given category, with all parents included
 */
function getProductCategoryLabel( state, categoryId, siteId = getSelectedSiteId( state ) ) {
	const categoryState = getRawCategoryState( state, siteId );
	const categories = categoryState.items || {};
	const category = categories[ categoryId ];
	if ( ! category ) {
		return '';
	}
	if ( ! Number( category.parent ) ) {
		return category.name;
	}
	return getProductCategoryLabel( state, category.parent, siteId ) + ` - ${ category.name }`;
}
