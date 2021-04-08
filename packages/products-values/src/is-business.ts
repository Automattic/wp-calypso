/**
 * Internal dependencies
 */
import { isBusinessPlan } from 'calypso/lib/plans';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isBusiness( product: FormattedProduct | CamelCaseProduct ): boolean {
	return isBusinessPlan( formatProduct( product ).product_slug );
}
