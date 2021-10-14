import { productMatches } from './product-matches';
import { JETPACK_SITE_PRODUCTS_WITH_FEATURES } from './products-list';
import type { JetpackProductSlug } from './types';

/**
 * Finds all keys of products matching a query
 *
 * For example:
 *
 * > findProductsKeys( { type: PRODUCT_JETPACK_BACKUP_DAILY } );
 * [PRODUCT_JETPACK_BACKUP_DAILY, PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY]
 *
 * @param {object} query @see productMatches
 * @returns {string[]} Matched product keys
 */
export function findProductKeys( query = {} ) {
	return Object.keys( JETPACK_SITE_PRODUCTS_WITH_FEATURES ).filter( ( k ) =>
		productMatches( JETPACK_SITE_PRODUCTS_WITH_FEATURES[ k as JetpackProductSlug ], query )
	);
}
