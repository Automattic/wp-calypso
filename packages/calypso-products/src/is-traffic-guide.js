import { WPCOM_TRAFFIC_GUIDE } from './constants';
import { formatProduct } from './format-product';

export function isTrafficGuide( product ) {
	product = formatProduct( product );

	return WPCOM_TRAFFIC_GUIDE === product.product_slug;
}
