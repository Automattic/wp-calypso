import 'calypso/state/products-list/init';
import type { ProductListItem } from './get-products-list';
import type { AppState } from 'calypso/types';

/**
 * Whether new buyers can purchase the product. Missing, loading or malformed
 * data counts as off sale, so a stale card never offers a retired product.
 */
export function isListedProductOnSale(
	productsList: Record< string, Pick< ProductListItem, 'available' > > | undefined,
	productSlug: string
): boolean {
	return productsList?.[ productSlug ]?.available === true;
}

export function isProductOnSale( state: AppState, productSlug: string ): boolean {
	return isListedProductOnSale( state.productsList?.items, productSlug );
}
