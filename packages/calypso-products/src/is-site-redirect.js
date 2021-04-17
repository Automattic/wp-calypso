/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function isSiteRedirect( product ) {
	product = formatProduct( product );

	return product.product_slug === 'offsite_redirect';
}
