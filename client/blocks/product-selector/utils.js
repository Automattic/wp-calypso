/**
 * External dependencies
 */
import { flattenDeep, pickBy, uniq } from 'lodash';

/**
 * Extract the product slugs out of an array of product objects.
 *
 * @param {Array} products Array of product objects.
 * @returns {Array} Array of the product slugs.
 */
export const extractProductSlugs = ( products ) =>
	uniq( flattenDeep( products.map( ( product ) => Object.values( product.options ) ) ) );

/**
 * Filter products to the ones that are within specified slugs.
 *
 * @param {object} products Product objects.
 * @param {Array} slugs Slugs to filter by.
 * @returns {object} Filtered products.
 */
export const filterByProductSlugs = ( products, slugs ) =>
	pickBy( products, ( product, productSlug ) => slugs.indexOf( productSlug ) >= 0 );
