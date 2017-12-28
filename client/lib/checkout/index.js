/** @format */

/**
 * Internal dependencies
 */

import { cartItems } from 'client/lib/cart-values';
import { managePurchase } from 'client/me/purchases/paths';

export function getExitCheckoutUrl( cart, siteSlug ) {
	let url = '/plans/';

	if ( cartItems.hasRenewalItem( cart ) ) {
		const { purchaseId, purchaseDomain } = cartItems.getRenewalItems( cart )[ 0 ].extra,
			siteName = siteSlug || purchaseDomain;

		return managePurchase( siteName, purchaseId );
	}

	if ( cartItems.hasDomainRegistration( cart ) ) {
		url = '/domains/add/';
	} else if ( cartItems.hasDomainMapping( cart ) ) {
		url = '/domains/add/mapping/';
	} else if ( cartItems.hasProduct( cart, 'offsite_redirect' ) ) {
		url = '/domains/add/site-redirect/';
	} else if ( cartItems.hasProduct( cart, 'premium_theme' ) ) {
		url = '/themes/';
	}

	return siteSlug ? url + siteSlug : url;
}
