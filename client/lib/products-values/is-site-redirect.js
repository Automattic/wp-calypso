/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isSiteRedirect( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === 'offsite_redirect';
}
