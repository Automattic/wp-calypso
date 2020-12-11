/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isTrafficGuide( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'traffic-guide' === product.product_slug;
}
