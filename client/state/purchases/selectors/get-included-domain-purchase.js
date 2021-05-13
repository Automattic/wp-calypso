/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal Dependencies
 */
import { isSubscription } from 'calypso/lib/purchases';
import {
	getIncludedDomainPurchaseAmount,
	isDomainRegistration,
	isDomainMapping,
} from '@automattic/calypso-products';
import { getSitePurchases } from './get-site-purchases';

import 'calypso/state/purchases/init';

/**
 * Returns a purchase object that corresponds to that subscription's included domain
 *
 * Even if a domain registration was purchased with the subscription, it will
 * not be returned if the domain product was paid for separately (eg: if it was
 * renewed on its own).
 *
 * @param   {object} state  global state
 * @param   {object} subscriptionPurchase  subscription purchase object
 * @returns {object} domain purchase if there is one, null if none found or not a subscription object passed
 */
export const getIncludedDomainPurchase = ( state, subscriptionPurchase ) => {
	if (
		! subscriptionPurchase ||
		! isSubscription( subscriptionPurchase ) ||
		getIncludedDomainPurchaseAmount( subscriptionPurchase )
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
