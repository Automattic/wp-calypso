/**
 * Internal dependencies
 */
import { isP2PlusPlan } from '@automattic/calypso-products';
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isP2Plus( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isP2PlusPlan( product.product_slug );
}
