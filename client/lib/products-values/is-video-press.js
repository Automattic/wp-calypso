/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isVideoPress( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'videopress' === product.product_slug;
}
