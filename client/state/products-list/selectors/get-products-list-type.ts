import type { AppState } from 'calypso/types';
import 'calypso/state/products-list/init';

export function getProductsListType( state: AppState ): string | null {
	return state.productsList?.type;
}
