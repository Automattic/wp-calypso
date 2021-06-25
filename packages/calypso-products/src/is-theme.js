/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function isTheme( product ) {
	product = formatProduct( product );

	return 'premium_theme' === product.product_slug;
}
