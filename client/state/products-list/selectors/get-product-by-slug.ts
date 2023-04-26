import 'calypso/state/products-list/init';
import type { ProductListItem } from './get-products-list';
import type { AppState } from 'calypso/types';

/**
 * Retrieves the product with the specified slug.
 *
 * @param {Object} state - global state tree
 * @param {string} productSlug - internal product slug, eg 'jetpack_premium'
 * @returns {import('./get-products-list').ProductListItem|null} the corresponding product, or null if not found
 */
export function getProductBySlug( state: AppState, productSlug: string ): ProductListItem | null {
	return state.productsList?.items?.[ productSlug ] ?? null;
}
