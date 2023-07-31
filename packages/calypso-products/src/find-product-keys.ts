import { productMatches } from './product-matches';
import { PRODUCTS_LIST } from './products-list';
import type { Query } from './product-matches';
import type { ProductSlug } from './types';

/**
 * Finds all keys of products matching a query
 *
 * For example:
 *
 * > findProductsKeys( { type: PRODUCT_JETPACK_BACKUP_DAILY } );
 * [PRODUCT_JETPACK_BACKUP_DAILY, PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY]
 */
export function findProductKeys( query: Query = {} ): ProductSlug[] {
	return Object.values( PRODUCTS_LIST )
		.map( ( { product_slug } ) => product_slug )
		.filter( ( productSlug ) => productMatches( productSlug, query ) );
}
