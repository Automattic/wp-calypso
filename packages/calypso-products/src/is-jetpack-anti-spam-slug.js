/**
 * External dependencies
 */
import { JETPACK_ANTI_SPAM_PRODUCTS } from './index';

export function isJetpackAntiSpamSlug( productSlug ) {
	return JETPACK_ANTI_SPAM_PRODUCTS.includes( productSlug );
}
