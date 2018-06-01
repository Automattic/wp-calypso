/** @format */

/**
 * Internal dependencies
 */

import { cartItems } from 'lib/cart-values';
import { managePurchase } from 'me/purchases/paths';

export function getExitCheckoutUrl( cart, siteSlug ) {
	let url = '/plans/';

	if ( cartItems.hasRenewalItem( cart ) ) {
		const { purchaseId } = cartItems.getRenewalItems( cart )[ 0 ].extra;
		return managePurchase( purchaseId );
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

export { getCreditCardType, validatePaymentDetails } from './validation';
export { maskField, unmaskField } from './masking';
