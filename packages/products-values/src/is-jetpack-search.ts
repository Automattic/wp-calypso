/**
 * Internal dependencies
 */
import { JETPACK_SEARCH_PRODUCTS } from 'calypso/lib/products-values/constants';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isJetpackSearch( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return JETPACK_SEARCH_PRODUCTS.includes( product.product_slug );
}
