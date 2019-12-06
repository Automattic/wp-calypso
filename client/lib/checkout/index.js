/**
 * Internal dependencies
 */

import {
	hasRenewalItem,
	getRenewalItems,
	hasDomainRegistration,
	hasDomainMapping,
	hasProduct,
} from 'lib/cart-values/cart-items';
import { managePurchase } from 'me/purchases/paths';

export function getExitCheckoutUrl( cart, siteSlug, upgradeIntent ) {
	let url = '/plans/';

	if ( hasRenewalItem( cart ) ) {
		const { purchaseId, purchaseDomain } = getRenewalItems( cart )[ 0 ].extra,
			siteName = siteSlug || purchaseDomain;

		return managePurchase( siteName, purchaseId );
	}

	switch ( upgradeIntent ) {
		case 'plugins':
		case 'themes':
			url = `/${ upgradeIntent }/`;
	}

	if ( hasDomainRegistration( cart ) ) {
		url = '/domains/add/';
	} else if ( hasDomainMapping( cart ) ) {
		url = '/domains/add/mapping/';
	} else if ( hasProduct( cart, 'offsite_redirect' ) ) {
		url = '/domains/add/site-redirect/';
	} else if ( hasProduct( cart, 'premium_theme' ) ) {
		url = '/themes/';
	}

	return siteSlug ? url + siteSlug : url;
}

export { getCreditCardType, validatePaymentDetails } from './validation';
export { maskField, unmaskField } from './masking';
