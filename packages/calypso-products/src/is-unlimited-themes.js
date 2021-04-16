/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isUnlimitedThemes( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'unlimited_themes' === product.product_slug;
}
