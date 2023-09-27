import { isDomainRegistration, isDomainMapping } from '@automattic/calypso-products';
import { find } from 'lodash';
import { isSubscription } from 'calypso/lib/purchases';
import { getSitePurchases } from './get-site-purchases';

import 'calypso/state/purchases/init';

/**
 * Returns a purchase object that corresponds to that subscription's included domain
 *
 * Even if a domain registration was purchased with the subscription, it will
 * not be returned if the domain product was paid for separately (eg: if it was
 * renewed on its own).
 * @param   {Object} state  global state
 * @param   {Object} subscriptionPurchase  subscription purchase object
 * @returns {Object} domain purchase if there is one, null if none found or not a subscription object passed
 */
export const getIncludedDomainPurchase = ( state, subscriptionPurchase ) => {
	if (
		! subscriptionPurchase ||
		! isSubscription( subscriptionPurchase ) ||
		subscriptionPurchase.included_domain_purchase_amount ||
		subscriptionPurchase.includedDomainPurchaseAmount
	) {
		return null;
	}

	const { includedDomain } = subscriptionPurchase;
	const sitePurchases = getSitePurchases( state, subscriptionPurchase.siteId );
	const domainPurchase = find(
		sitePurchases,
		( purchase ) =>
			( isDomainMapping( purchase ) || isDomainRegistration( purchase ) ) &&
			includedDomain === purchase.meta
	);

	return domainPurchase;
};
