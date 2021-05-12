/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';
import { isJetpackAntiSpamSlug } from './is-jetpack-anti-spam-slug';

export function isJetpackAntiSpam( product ) {
	product = formatProduct( product );

	return isJetpackAntiSpamSlug( product.product_slug );
}
