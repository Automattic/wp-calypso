/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function isGuidedTransfer( product ) {
	product = formatProduct( product );

	return 'guided_transfer' === product.product_slug;
}
