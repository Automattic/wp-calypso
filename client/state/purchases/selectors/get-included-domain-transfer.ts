import { isDomainTransfer } from '@automattic/calypso-products';
import { isSubscription } from 'calypso/lib/purchases';
import { getSitePurchases } from './get-site-purchases';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { AppState } from 'calypso/types';
import 'calypso/state/purchases/init';

/**
 * Returns a purchase object that corresponds to that subscription's transferred domain
 *
 * @param   {AppState} state  global state
 * @param   {Purchase | null | undefined} subscriptionPurchase  subscription purchase object
 * @returns {Purchase | null | undefined} domain transfer purchase if there is one, null if none found or not a subscription object passed
 */
export const getIncludedDomainTransfer = (
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
		( purchase ) => isDomainTransfer( purchase ) && includedDomain === purchase.meta
	);
};
