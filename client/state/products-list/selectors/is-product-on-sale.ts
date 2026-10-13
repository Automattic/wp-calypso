import 'calypso/state/products-list/init';
import type { ProductListItem } from './get-products-list';
import type { AppState } from 'calypso/types';

type ListedAvailability = Record< string, Pick< ProductListItem, 'available' > >;

/**
 * Whether new buyers can purchase the product. Missing, loading or malformed
 * data counts as off sale, so a stale card never offers a retired product.
 */
export function isListedProductOnSale(
	productsList: ListedAvailability | undefined,
	productSlug: string
): boolean {
	return productsList?.[ productSlug ]?.available === true;
}

/**
 * The Jetpack products list, only once this session has received it. Persisted
 * items, a failed refresh or a different list type are not returned.
 */
export function getFreshJetpackProductsList( state: AppState ): ListedAvailability | undefined {
	return state.productsList?.receivedTypeThisSession === 'jetpack'
		? state.productsList.items
		: undefined;
}

export function isJetpackProductOnSale( state: AppState, productSlug: string ): boolean {
	return isListedProductOnSale( getFreshJetpackProductsList( state ), productSlug );
}
