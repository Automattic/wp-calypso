/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isCredits( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'wordpress-com-credits' === product.product_slug;
}
