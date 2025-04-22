import { isDomainTransfer } from '@automattic/calypso-products';
import { find } from 'lodash';
import { isSubscription } from 'calypso/lib/purchases';
import { getSitePurchases } from './get-site-purchases';

import 'calypso/state/purchases/init';

/**
 * Returns a purchase object that corresponds to that subscription's transferred domain
 *
 * Even if a domain transfer was purchased with the subscription, it will
 * not be returned if the domain transfer product was paid for separately (eg: if it was
 * renewed on its own).
 * @param   {Object} state  global state
 * @param   {Object} subscriptionPurchase  subscription purchase object
 * @returns {Object} domain transfer purchase if there is one, null if none found or not a subscription object passed
 */
export const getIncludedDomainTransfer = ( state, subscriptionPurchase ) => {
	if ( ! subscriptionPurchase || ! isSubscription( subscriptionPurchase ) ) {
		return null;
	}

	const { includedDomain } = subscriptionPurchase;
	const sitePurchases = getSitePurchases( state, subscriptionPurchase.siteId );
	return find(
		sitePurchases,
		( purchase ) => isDomainTransfer( purchase ) && includedDomain === purchase.meta
	);
};
