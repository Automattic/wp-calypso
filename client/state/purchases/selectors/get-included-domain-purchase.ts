import { isDomainRegistration, isDomainMapping } from '@automattic/calypso-products';
import { isSubscription } from 'calypso/lib/purchases';
import { getSitePurchases } from './get-site-purchases';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { AppState } from 'calypso/types';
import 'calypso/state/purchases/init';

/**
 * Returns a purchase object that corresponds to that subscription's included domain
 *
 * Even if a domain registration was purchased with the subscription, it will
 * not be returned if the domain product was paid for separately (eg: if it was
 * renewed on its own).
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
			( isDomainMapping( purchase ) || isDomainRegistration( purchase ) ) &&
			includedDomain === purchase.meta
	);
};
