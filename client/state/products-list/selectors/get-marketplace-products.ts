import { getProductsList } from './get-products-list';
import type { ProductListItem } from './get-products-list';
import type { AppState } from 'calypso/types';

export function getMarketplaceProducts( state: AppState, searchSlug: string ): ProductListItem[] {
	if ( ! searchSlug ) {
		return [];
	}

	const productsList = getProductsList( state );
	const entries = Object.entries( productsList ).filter(
		( [ storeProductSlug, { product_type, billing_product_slug } ] ) =>
			( searchSlug === storeProductSlug || searchSlug === billing_product_slug ) &&
			product_type?.startsWith?.( 'marketplace' )
	);

	return entries.map( ( [ , product ] ) => product );
}
