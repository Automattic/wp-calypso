/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isVipPlan( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return 'vip' === product.product_slug;
}
