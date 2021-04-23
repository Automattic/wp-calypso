/**
 * Internal dependencies
 */
import { PLAN_CHARGEBACK } from '@automattic/calypso-products';
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isChargeback( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === PLAN_CHARGEBACK;
}
