/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isUnlimitedSpace( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return 'unlimited_space' === product.product_slug;
}
