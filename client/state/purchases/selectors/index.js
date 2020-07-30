/**
 * Internal Dependencies
 */
import 'state/purchases/init';

export { getPurchases } from './get-purchases';
export { getUserPurchases } from './get-user-purchases';
export { getPurchasesError } from './get-purchases-error';
export { getByPurchaseId } from './get-by-purchase-id';
export { getSitePurchases } from './get-site-purchases';
export { getRenewableSitePurchases } from './get-renewable-site-purchases';
export { siteHasJetpackProductPurchase } from './site-has-jetpack-product-purchase';
export { siteHasBackupProductPurchase } from './site-has-backup-product-purchase';
export { siteHasScanProductPurchase } from './site-has-scan-product-purchase';
export { getIncludedDomainPurchase } from './get-included-domain-purchase';
export { getDowngradePlanFromPurchase } from './get-downgrade-plan-from-purchase';
export { getDowngradePlanRawPrice } from './get-downgrade-plan-raw-price';
export { isUserPaid } from './is-user-paid';

export const isFetchingUserPurchases = ( state ) => state.purchases.isFetchingUserPurchases;
export const isFetchingSitePurchases = ( state ) => state.purchases.isFetchingSitePurchases;
export const hasLoadedUserPurchasesFromServer = ( state ) =>
	state.purchases.hasLoadedUserPurchasesFromServer;
export const hasLoadedSitePurchasesFromServer = ( state ) =>
	state.purchases.hasLoadedSitePurchasesFromServer;
