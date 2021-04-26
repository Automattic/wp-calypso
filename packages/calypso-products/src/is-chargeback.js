/**
 * Internal dependencies
 */
import { PLAN_CHARGEBACK } from './index';
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isChargeback( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === PLAN_CHARGEBACK;
}
