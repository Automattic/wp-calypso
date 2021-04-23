/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isCustomDesign( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'custom-design' === product.product_slug;
}
