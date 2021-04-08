/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isCustomDesign( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return 'custom-design' === product.product_slug;
}
