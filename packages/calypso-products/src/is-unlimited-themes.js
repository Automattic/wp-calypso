/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function isUnlimitedThemes( product ) {
	product = formatProduct( product );

	return 'unlimited_themes' === product.product_slug;
}
