/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isVideoPress( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return 'videopress' === product.product_slug;
}
