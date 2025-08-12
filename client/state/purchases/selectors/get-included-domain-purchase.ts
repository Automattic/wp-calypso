import {
	isDomainRegistration,
	isDomainMapping,
	isDomainTransfer,
} from '@automattic/calypso-products';
import { isSubscription } from 'calypso/lib/purchases';
import { getSitePurchases } from './get-site-purchases';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { AppState } from 'calypso/types';
import 'calypso/state/purchases/init';

/**
 * Returns a purchase object that corresponds to that subscription's included domain.
 *
 * This can return any type of domain subscription that is eligible to be
 * included with the plan by virtue of having used the plan's domain credit
 * (including domain registrations, domain transfers, and domain mappings).
 *
 * Even if a domain is included with the plan, it will not be returned here if
 * the domain was paid for separately (e.g., if it was renewed on its own).
 * @param   {AppState} state  global state
 * @param   {Purchase | null | undefined} subscriptionPurchase  subscription purchase object
 * @returns {Purchase | null | undefined} domain purchase if there is one, null if none found or not a subscription object passed
 */
export const getIncludedDomainPurchase = (
	state: AppState,
	subscriptionPurchase: Purchase | null | undefined
): Purchase | null | undefined => {
	if (
		! subscriptionPurchase ||
		! isSubscription( subscriptionPurchase ) ||
		subscriptionPurchase.includedDomainPurchaseAmount
	) {
		return null;
	}

	const { includedDomain } = subscriptionPurchase;
	const sitePurchases = getSitePurchases( state, subscriptionPurchase.siteId );
	return sitePurchases.find(
		( purchase ) =>
			( isDomainMapping( purchase ) ||
				isDomainRegistration( purchase ) ||
				isDomainTransfer( purchase ) ) &&
			includedDomain === purchase.meta
	);
};
