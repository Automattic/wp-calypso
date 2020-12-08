/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isUnlimitedSpace( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'unlimited_space' === product.product_slug;
}
