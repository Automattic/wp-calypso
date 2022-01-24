import type { AppState } from 'calypso/types';
import 'calypso/state/products-list/init';

export function getProductsListType( state: AppState ): Record< string, string | null > {
	return state.productsList?.productsListType;
}
