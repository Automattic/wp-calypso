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

	if ( hasDomainProduct ) {
		return 'domain';
	}

	if ( hasGSuite ) {
		return 'gsuite';
	}

	return 'tax';
}
