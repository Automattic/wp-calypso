/**
 * Internal dependencies
 */
import { PLAN_WPCOM_ENTERPRISE } from 'lib/plans/constants';
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';

export function isEnterprise( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === PLAN_WPCOM_ENTERPRISE;
}
