/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isJetpackProductSlug } from 'calypso/lib/products-values/is-jetpack-product-slug';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isJetpackProduct( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return isJetpackProductSlug( product.product_slug );
}
