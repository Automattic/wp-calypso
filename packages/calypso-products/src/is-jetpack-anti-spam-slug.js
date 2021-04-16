/**
 * External dependencies
 */
import { JETPACK_ANTI_SPAM_PRODUCTS } from '@automattic/calypso-products';

export function isJetpackAntiSpamSlug( productSlug ) {
	return JETPACK_ANTI_SPAM_PRODUCTS.includes( productSlug );
}
