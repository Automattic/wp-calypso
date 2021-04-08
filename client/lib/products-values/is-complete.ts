/**
 * Internal dependencies
 */
import { isCompletePlan } from 'calypso/lib/plans';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isComplete( product: FormattedProduct | CamelCaseProduct ): boolean {
	return isCompletePlan( formatProduct( product ).product_slug );
}
