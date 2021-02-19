/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isFreeWordPressComDomain( product ) {
	product = formatProduct( product );
	assertValidProduct( product );
	return product.is_free === true;
}
