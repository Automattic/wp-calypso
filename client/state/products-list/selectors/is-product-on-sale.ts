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
 * The products list, only once this session has received it in full. Persisted
 * items, a failed refresh or a slug-filtered list are not returned.
 */
export function getFreshProductsList( state: AppState ): ListedAvailability | undefined {
	return state.productsList?.sessionListStatus === 'full' ? state.productsList.items : undefined;
}

export function hasProductsListRequestFailed( state: AppState ): boolean {
	return state.productsList?.sessionListStatus === 'failed';
}

export function isProductOnSale( state: AppState, productSlug: string ): boolean {
	return isListedProductOnSale( getFreshProductsList( state ), productSlug );
}
