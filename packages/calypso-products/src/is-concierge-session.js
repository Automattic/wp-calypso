/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function isConciergeSession( product ) {
	product = formatProduct( product );

	return 'concierge-session' === product.product_slug;
}
