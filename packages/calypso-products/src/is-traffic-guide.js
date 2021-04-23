/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';
import { WPCOM_TRAFFIC_GUIDE } from './plans-constants';

export function isTrafficGuide( product ) {
	product = snakeCase( product );

	return WPCOM_TRAFFIC_GUIDE === product.product_slug;
}
