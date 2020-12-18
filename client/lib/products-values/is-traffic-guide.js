/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { WPCOM_TRAFFIC_GUIDE } from 'calypso/lib/products-values/constants';

export function isTrafficGuide( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return WPCOM_TRAFFIC_GUIDE === product.product_slug;
}
