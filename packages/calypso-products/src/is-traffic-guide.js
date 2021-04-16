/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';
import { WPCOM_TRAFFIC_GUIDE } from '@automattic/calypso-products';

export function isTrafficGuide( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return WPCOM_TRAFFIC_GUIDE === product.product_slug;
}
