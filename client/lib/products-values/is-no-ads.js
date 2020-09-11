/**
 * Internal dependencies
 */
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';

export function isNoAds( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'no-adverts/no-adverts.php' === product.product_slug;
}
