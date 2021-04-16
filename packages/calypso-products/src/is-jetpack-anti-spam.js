/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';
import { isJetpackAntiSpamSlug } from './is-jetpack-anti-spam-slug';

export function isJetpackAntiSpam( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isJetpackAntiSpamSlug( product.product_slug );
}
