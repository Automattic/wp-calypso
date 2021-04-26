/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isConciergeSession( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'concierge-session' === product.product_slug;
}
