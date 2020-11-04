/**
 * External dependencies
 */
import type { ResponseCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import type { ContactDetailsType } from '../types/contact-details';
import {
	hasGoogleApps,
	hasDomainRegistration,
	hasTransferProduct,
} from 'calypso/lib/cart-values/cart-items';

export default function getContactDetailsType( responseCart: ResponseCart ): ContactDetailsType {
	const hasDomainProduct =
		hasDomainRegistration( responseCart ) || hasTransferProduct( responseCart );
	const hasGSuite = hasGoogleApps( responseCart );
	const isPurchaseFree = responseCart.total_cost_integer === 0;
	const isFullCredits =
		! isPurchaseFree &&
		responseCart.credits_integer > 0 &&
		responseCart.credits_integer >= responseCart.sub_total_integer;

	if ( hasDomainProduct ) {
		return 'domain';
	}

	if ( hasGSuite ) {
		return 'gsuite';
	}

	if ( isPurchaseFree || isFullCredits ) {
		return 'none';
	}

	return 'tax';
}
