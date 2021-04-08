/**
 * Internal dependencies
 */
import { isBloggerPlan } from 'calypso/lib/plans';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isBlogger( product: FormattedProduct | CamelCaseProduct ): boolean {
	return isBloggerPlan( formatProduct( product ).product_slug );
}
