/**
 * Internal dependencies
 */
import { PLAN_CHARGEBACK } from 'calypso/lib/plans/constants';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isChargeback( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return product.product_slug === PLAN_CHARGEBACK;
}
