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
	getProductCategories,
} from 'woocommerce/state/sites/product-categories/selectors';
import { getBucket } from '../helpers';

/**
 * Gets all edits for product categories.
 *
 * @param {Object} rootState Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, will use selected Site ID
 * @return {Object} All product category edits in the form of { creates: [], updates: [] }
 */
export function getAllProductCategoryEdits( rootState, siteId = getSelectedSiteId( rootState ) ) {
	return get(
		rootState,
		[ 'extensions', 'woocommerce', 'ui', 'productCategories', siteId, 'edits' ],
		{}
	);
}

/**
 * Gets the accumulated edits for a category, if any.
 *
 * @param {Object} rootState Global state tree
 * @param {Number|Object} categoryId The id of the product category (or { index: # } if pending create)
 * @param {Number} [siteId] Site ID to check. If not provided, will use selected Site ID
 * @return {Object} The current accumulated edits
 */
export function getProductCategoryEdits( rootState, categoryId, siteId ) {
	const edits = getAllProductCategoryEdits( rootState, siteId );
	const bucket = getBucket( { id: categoryId } );
	const array = get( edits, bucket, [] );

	return find( array, { id: categoryId } );
}

/**
 * Gets a category with local edits overlayed on top of fetched data.
 *
 * @param {Object} rootState Global state tree
 * @param {Number|Object} categoryId The id of the product category (or { index: # } if pending create)
 * @param {Number} [siteId] Site ID to check. If not provided, will use selected Site ID
 * @return {Object} The category data merged between the fetched data and edits
 */
export function getProductCategoryWithLocalEdits( rootState, categoryId, siteId ) {
	const existing = isNumber( categoryId );

	const category = existing && getProductCategory( rootState, categoryId, siteId );
	const categoryEdits = getProductCategoryEdits( rootState, categoryId, siteId );

	return category || categoryEdits ? { ...category, ...categoryEdits } : undefined;
}

/**
 * Gets all categories, either fetched, edited, or both.
 *
 * This returns a list of all fetched categories overlaid with updates (if any) and
 * all categories in the creates list as well.
 *
 * @param {Object} rootState Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, will use selected Site ID
 * @return {Object} The category list merged between the fetched data, edits, and creates
 */
export function getProductCategoriesWithLocalEdits( rootState, siteId ) {
	const categoryCreates = getAllProductCategoryEdits( rootState, siteId ).creates || [];
	const fetchedCategoriesWithUpdates = getProductCategories( rootState, {}, siteId ).map( c =>
		getProductCategoryWithLocalEdits( rootState, c.id, siteId )
	);

	return [ ...categoryCreates, ...fetchedCategoriesWithUpdates ];
}

/**
 * Gets the product category last edited in the UI.
 *
 * @param {Object} rootState Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, will use selected Site ID
 * @return {Object} The category data merged between the fetched data and edits
 */
export function getCurrentlyEditingProductCategory( rootState, siteId ) {
	const { currentlyEditingId } = getAllProductCategoryEdits( rootState, siteId );

	return getProductCategoryWithLocalEdits( rootState, currentlyEditingId, siteId );
}
