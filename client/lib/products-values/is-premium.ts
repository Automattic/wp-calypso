/**
 * Internal dependencies
 */
import { isPremiumPlan } from 'calypso/lib/plans';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isPremium( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return isPremiumPlan( product.product_slug );
}
