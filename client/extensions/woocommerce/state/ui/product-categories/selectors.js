/** @format */

/**
 * External dependencies
 */

import { get, find, isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getProductCategory,
	getAllProductCategories,
} from 'woocommerce/state/sites/product-categories/selectors';
import { getBucket } from '../helpers';

/**
 * Gets all edits for product categories.
 *
 * @param {Object} state Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, will use selected Site ID
 * @return {Object} All product category edits in the form of { creates: [], updates: [] }
 */
export function getAllProductCategoryEdits( state, siteId = getSelectedSiteId( state ) ) {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'ui', 'productCategories', siteId, 'edits' ],
		{}
	);
}

/**
 * Gets the accumulated edits for a category, if any.
 *
 * @param {Object} state Global state tree
 * @param {Number|Object} categoryId The id of the product category (or { index: # } if pending create)
 * @param {Number} [siteId] Site ID to check. If not provided, will use selected Site ID
 * @return {Object} The current accumulated edits
 */
export function getProductCategoryEdits( state, categoryId, siteId = getSelectedSiteId( state ) ) {
	const edits = getAllProductCategoryEdits( state, siteId );
	const bucket = getBucket( { id: categoryId } );
	const array = get( edits, bucket, [] );

	return find( array, { id: categoryId } );
}

/**
 * Gets a category with local edits overlayed on top of fetched data.
 *
 * @param {Object} state Global state tree
 * @param {Number|Object} categoryId The id of the product category (or { index: # } if pending create)
 * @param {Number} [siteId] Site ID to check. If not provided, will use selected Site ID
 * @return {Object} The category data merged between the fetched data and edits
 */
export function getProductCategoryWithLocalEdits(
	state,
	categoryId,
	siteId = getSelectedSiteId( state )
) {
	const existing = isNumber( categoryId );

	const category = existing && getProductCategory( state, categoryId, siteId );
	const categoryEdits = getProductCategoryEdits( state, categoryId, siteId );

	return category || categoryEdits ? { ...category, ...categoryEdits } : undefined;
}

/**
 * Gets all categories, either fetched, edited, or both.
 *
 * This returns a list of all fetched categories overlaid with updates (if any) and
 * all categories in the creates list as well.
 *
 * @param {Object} state Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, will use selected Site ID
 * @return {Object} The category list merged between the fetched data, edits, and creates
 */
export function getProductCategoriesWithLocalEdits( state, siteId = getSelectedSiteId( state ) ) {
	const categoryCreates = getAllProductCategoryEdits( state, siteId ).creates || [];
	const fetchedCategories = getAllProductCategories( state, {}, siteId );
	const categoriesWithUpdates = fetchedCategories.map( c =>
		getProductCategoryWithLocalEdits( state, c.id, siteId )
	);

	return [ ...categoryCreates, ...categoriesWithUpdates ];
}

/**
 * Gets the product category last edited in the UI.
 *
 * @param {Object} state Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, will use selected Site ID
 * @return {Object} The category data merged between the fetched data and edits
 */
export function getCurrentlyEditingProductCategory( state, siteId = getSelectedSiteId( state ) ) {
	const { currentlyEditingId } = getAllProductCategoryEdits( state, siteId );

	return getProductCategoryWithLocalEdits( state, currentlyEditingId, siteId );
}

/**
 * Gets the id of the currently editing product category.
 *
 * @param {Object} state Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number|Object} Id of the currently editing product category.
 */
export function getCurrentlyEditingId( state, siteId = getSelectedSiteId( state ) ) {
	const edits = getAllProductCategoryEdits( state, siteId ) || {};
	const { currentlyEditingId } = edits;

	return currentlyEditingId;
}
