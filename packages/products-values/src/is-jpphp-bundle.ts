/**
 * Internal dependencies
 */
import { PLAN_HOST_BUNDLE } from 'calypso/lib/plans/constants';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isJpphpBundle( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return product.product_slug === PLAN_HOST_BUNDLE;
}
