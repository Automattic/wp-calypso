/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isJetpackAntiSpamSlug } from 'calypso/lib/products-values/is-jetpack-anti-spam-slug';

export function isJetpackAntiSpam( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isJetpackAntiSpamSlug( product.product_slug );
}
