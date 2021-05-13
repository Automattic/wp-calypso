/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function isCredits( product ) {
	product = formatProduct( product );

	return 'wordpress-com-credits' === product.product_slug;
}
