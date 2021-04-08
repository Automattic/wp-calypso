/**
 * Internal dependencies
 */
import { isEcommercePlan } from 'calypso/lib/plans';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isEcommerce( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return isEcommercePlan( product.product_slug );
}
