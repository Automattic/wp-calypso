/**
 * Internal Dependencies
 */
import 'calypso/state/purchases/init';

export const isFetchingUserPurchases = ( state ) => state.purchases.isFetchingUserPurchases;
export const isFetchingSitePurchases = ( state ) => state.purchases.isFetchingSitePurchases;
export const hasLoadedUserPurchasesFromServer = ( state ) =>
	state.purchases.hasLoadedUserPurchasesFromServer;
export const hasLoadedSitePurchasesFromServer = ( state ) =>
	state.purchases.hasLoadedSitePurchasesFromServer;
