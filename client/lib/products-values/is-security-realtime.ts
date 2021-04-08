/**
 * Internal dependencies
 */
import { isSecurityRealTimePlan } from 'calypso/lib/plans';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isSecurityRealTime( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return isSecurityRealTimePlan( product.product_slug );
}
