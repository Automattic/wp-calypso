/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isGuidedTransfer( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'guided_transfer' === product.product_slug;
}
