/**
 * External dependencies
 */
import { get, isArray, omit, some, range, values } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSerializedProductCategoriesQuery } from './utils';

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object} State tree local to product categories reducer
 */
function getRawCategoryState( state, siteId = getSelectedSiteId( state ) ) {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'productCategories' ], {} );
}

/**
 * @param {object} state Whole Redux state tree
 * @param {object} [query] Query used to fetch product categories. If not provided, API defaults are used.
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether product categories have been successfully loaded from the server
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
 * @param {object} state Whole Redux state tree
 * @param {object} [query] Query used to fetch product categories. If not provided, API defaults are used.
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether product categories are currently being retrieved from the server
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
 * Returns true if currently requesting product categories for any query, or false otherwise.
 *
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean}       Returns true if currently requesting product categories for any query
 */
export function areAnyProductCategoriesLoading( state, siteId = getSelectedSiteId( state ) ) {
	const categoryState = getRawCategoryState( state, siteId );
	return some( categoryState.isQueryLoading );
}

/**
 * Gets product category fetched from API data.
 *
 * @param {object} state Global state tree
 * @param {number} categoryId The id of the category sought
 * @param {number} siteId wpcom site id
 * @returns {object|null} Product category if found, otherwise null.
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
 * @param {object} state Global state tree
 * @param {object} [query] Query used to fetch product categories. If not provided, API defaults are used.
 * @param {number} [siteId] wpcom site id, if not provided, uses the selected site id.
 * @returns {Array} List of product categories
 */
export function getProductCategories( state, query = {}, siteId = getSelectedSiteId( state ) ) {
	if ( ! areProductCategoriesLoaded( state, query, siteId ) ) {
		return [];
	}
	const serializedQuery = getSerializedProductCategoriesQuery( query );
	const categoryState = getRawCategoryState( state, siteId );
	const idsForQuery = categoryState.queries && categoryState.queries[ serializedQuery ];

	if ( idsForQuery.length ) {
		return idsForQuery.map( ( id ) => getProductCategory( state, id, siteId ) );
	}

	return [];
}

/**
 * Gets all product categories from API data, as currently loaded in the state (might not
 * be all the products on the remote site, if they haven't all been requested).
 *
 * @param {object} state Global state tree
 * @param {number} [siteId] wpcom site id, if not provided, uses the selected site id.
 * @returns {Array} List of product categories
 */
export function getAllProductCategories( state, siteId = getSelectedSiteId( state ) ) {
	const categoryState = getRawCategoryState( state, siteId );
	const items = values( categoryState.items ) || [];
	return items.map( ( cat ) => getProductCategory( state, cat.id, siteId ) );
}

/**
 * Gets all product categories from API data, as currently loaded in the state (might not
 * be all the products on the remote site, if they haven't all been requested).
 *
 * @param {object} state Global state tree
 * @param {string} search Search term to filter responses
 * @param {number} [siteId] wpcom site id, if not provided, uses the selected site id.
 * @returns {Array} List of product categories for a search query
 */
export function getAllProductCategoriesBySearch(
	state,
	search,
	siteId = getSelectedSiteId( state )
) {
	const lastPage = getProductCategoriesLastPage( state, { search }, siteId );
	if ( null === lastPage ) {
		return [];
	}

	const result = [];
	range( 1, lastPage + 1 ).some( ( page ) => {
		const query = {
			search,
			page,
		};
		const categories = getProductCategories( state, query, siteId );
		result.push( ...categories );
	} );

	return result;
}

/**
 * @param {object} state Whole Redux state tree
 * @param {object} [query] Query used to fetch product categories. If not provided, API defaults are used.
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {number|null} Total number of pages available for a query, or null if not loaded yet.
 */
export function getProductCategoriesLastPage(
	state,
	query = {},
	siteId = getSelectedSiteId( state )
) {
	const serializedQuery = getSerializedProductCategoriesQuery(
		omit( query, [ 'page', 'offset' ] )
	);
	const categoryState = getRawCategoryState( state, siteId );
	return ( categoryState.totalPages && categoryState.totalPages[ serializedQuery ] ) || null;
}

/**
 * @param {object} state Whole Redux state tree
 * @param {object} [query] Query used to fetch product categories. If not provided, API defaults are used.
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {number} Total number of product categories available for a query, or 0 if not loaded yet.
 */
export function getTotalProductCategories(
	state,
	query = {},
	siteId = getSelectedSiteId( state )
) {
	const serializedQuery = getSerializedProductCategoriesQuery(
		omit( query, [ 'page', 'offset' ] )
	);
	const categoryState = getRawCategoryState( state, siteId );
	return ( categoryState.total && categoryState.total[ serializedQuery ] ) || 0;
}

/*
 * Get the label for a given product, recursively including parent names.
 *
 * @param {object} state Global state tree
 * @param {number} categoryId ID of the starting category.
 * @param {number} [siteId] wpcom site id, if not provided, uses the selected site id.
 * @returns {string} Label of given category, with all parents included
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
