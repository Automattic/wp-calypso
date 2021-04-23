/**
 * Internal dependencies
 */
import { PLAN_WPCOM_ENTERPRISE } from './constants';
import { formatProduct } from './format-product';

export function isEnterprise( product ) {
	product = formatProduct( product );

	return product.product_slug === PLAN_WPCOM_ENTERPRISE;
}
