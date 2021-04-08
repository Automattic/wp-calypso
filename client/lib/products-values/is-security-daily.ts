/**
 * Internal dependencies
 */
import { isSecurityDailyPlan } from 'calypso/lib/plans';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isSecurityDaily( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return isSecurityDailyPlan( product.product_slug );
}
