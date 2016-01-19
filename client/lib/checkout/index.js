/**
 * Internal dependencies
 */
import { cartItems } from 'lib/cart-values';
import { managePurchase } from 'me/purchases/paths';

export function getExitCheckoutUrl( cart, siteSlug ) {
	let url = '/plans/';

	if ( cartItems.hasDomainRegistration( cart ) ) {
		url = '/domains/add/';
	} else if ( cartItems.hasDomainMapping( cart ) ) {
		url = '/domains/add/mapping/';
	} else if ( cartItems.hasProduct( cart, 'offsite_redirect' ) ) {
		url = '/domains/add/site-redirect/';
	} else if ( cartItems.hasProduct( cart, 'premium_theme' ) ) {
		url = '/design/';
	}

	url = url + siteSlug;

	if ( cartItems.hasRenewalItem( cart ) ) {
		let renewalItem = cartItems.getRenewalItems( cart )[ 0 ];

		url = managePurchase( renewalItem.extra.purchaseDomain, renewalItem.extra.purchaseId );
	}

	return url;
}
