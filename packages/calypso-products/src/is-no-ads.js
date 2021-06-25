/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function isNoAds( product ) {
	product = formatProduct( product );

	return 'no-adverts/no-adverts.php' === product.product_slug;
}
