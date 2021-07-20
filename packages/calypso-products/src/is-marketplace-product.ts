import { MARKETPLACE_PRODUCTS } from './constants';

export function isMarketplaceProduct( product: { productSlug: string } ): boolean {
	return MARKETPLACE_PRODUCTS.includes( product.productSlug );
}
