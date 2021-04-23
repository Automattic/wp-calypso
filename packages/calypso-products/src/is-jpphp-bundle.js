/**
 * Internal dependencies
 */
import { PLAN_HOST_BUNDLE } from './constants';
import { formatProduct } from './format-product';

export function isJpphpBundle( product ) {
	product = formatProduct( product );

	return product.product_slug === PLAN_HOST_BUNDLE;
}
