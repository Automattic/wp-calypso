/**
 * External dependencies
 */
import type { ResponseCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import type { ContactDetailsType } from '../types/contact-details';
import {
	hasDomainRegistration,
	hasTransferProduct,
	hasOnlyRenewalItems,
} from 'calypso/lib/cart-values/cart-items';
import { isGSuiteProductSlug } from 'calypso/lib/gsuite';

export default function getContactDetailsType( responseCart: ResponseCart ): ContactDetailsType {
	const hasDomainProduct =
		hasDomainRegistration( responseCart ) || hasTransferProduct( responseCart );
	const hasNewGSuite = responseCart.products.some(
		( product ) => isGSuiteProductSlug( product.product_slug ) // Do not show the G Suite form for extra licenses
	);
	const isOnlyRenewals = hasOnlyRenewalItems( responseCart );
	const isPurchaseFree = responseCart.total_cost_integer === 0;
	const isFullCredits =
		! isPurchaseFree &&
		responseCart.credits_integer > 0 &&
		responseCart.credits_integer >= responseCart.sub_total_integer;

	if ( hasDomainProduct && ! isOnlyRenewals ) {
		return 'domain';
	}

	if ( hasNewGSuite && ! isOnlyRenewals ) {
		return 'gsuite';
	}

	if ( isPurchaseFree || isFullCredits ) {
		return 'none';
	}

	return 'tax';
}
