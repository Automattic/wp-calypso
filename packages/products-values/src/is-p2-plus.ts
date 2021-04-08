/**
 * Internal dependencies
 */
import { isP2PlusPlan } from 'calypso/lib/plans';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isP2Plus( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return isP2PlusPlan( product.product_slug );
}
