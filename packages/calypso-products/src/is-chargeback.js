/**
 * Internal dependencies
 */
import { PLAN_CHARGEBACK } from './index';
import { formatProduct } from './format-product';

export function isChargeback( product ) {
	product = formatProduct( product );

	return product.product_slug === PLAN_CHARGEBACK;
}
