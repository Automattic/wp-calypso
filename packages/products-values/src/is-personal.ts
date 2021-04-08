/**
 * Internal dependencies
 */
import { isPersonalPlan } from 'calypso/lib/plans';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isPersonal( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return isPersonalPlan( product.product_slug );
}
