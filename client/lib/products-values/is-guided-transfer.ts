/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isGuidedTransfer( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return 'guided_transfer' === product.product_slug;
}
