/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function isUnlimitedSpace( product ) {
	product = formatProduct( product );

	return 'unlimited_space' === product.product_slug;
}
