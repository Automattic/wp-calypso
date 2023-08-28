import 'calypso/state/products-list/init';
import type { ProductsList } from '@automattic/data-stores';
import type { AppState } from 'calypso/types';

/**
 * Retrieves an introductory offer for the product with the specified slug.
 *
 * @param {Object} state - global state tree
 * @param {string} productSlug - internal product slug, eg 'jetpack_premium'
 * @returns {import('./get-products-list').ProductIntroductoryOffer|null} - introductory offer details for the product, or null if no offer exists
 */
export function getProductIntroductoryOffer(
	state: AppState,
	productSlug: string
): ProductsList.ProductIntroductoryOffer | null {
	return state.productsList?.items?.[ productSlug ]?.introductory_offer ?? null;
}
