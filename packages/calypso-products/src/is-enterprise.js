/**
 * Internal dependencies
 */
import { PLAN_WPCOM_ENTERPRISE } from './index';
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isEnterprise( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === PLAN_WPCOM_ENTERPRISE;
}
