/**
 * External dependencies
 */
import { pickBy } from 'lodash';

/**
 * Extract the product slugs out of a product object.
 *
 * @param {object} product Product object (see `products` propTypes definition below).
 * @returns {array} Array of the product slugs.
 */
export const extractProductSlugs = product => Object.values( product.options );

/**
 * Filter products to the ones that are within specified slugs.
 *
 * @param {object} products Product objects.
 * @param {array} slugs Slugs to filter by.
 * @returns {array} Filtered products.
 */
export const filterByProductSlugs = ( products, slugs ) =>
	pickBy( products, ( product, productSlug ) => slugs.indexOf( productSlug ) >= 0 );
