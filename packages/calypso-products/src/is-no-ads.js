/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isNoAds( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'no-adverts/no-adverts.php' === product.product_slug;
}
