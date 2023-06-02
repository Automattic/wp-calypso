import { PRODUCTS_LIST } from './products-list';
import type { Product, ProductSlug } from './types';

export function getProductFromSlug( productSlug: string ): Product | string {
	if ( PRODUCTS_LIST[ productSlug as ProductSlug ] ) {
		return PRODUCTS_LIST[ productSlug as ProductSlug ];
	}
	return productSlug; // Consistent behavior with `getPlan`.
}
