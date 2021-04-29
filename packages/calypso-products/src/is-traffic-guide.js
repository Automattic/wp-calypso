/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';
import { WPCOM_TRAFFIC_GUIDE } from './index';

export function isTrafficGuide( product ) {
	product = formatProduct( product );

	return WPCOM_TRAFFIC_GUIDE === product.product_slug;
}
