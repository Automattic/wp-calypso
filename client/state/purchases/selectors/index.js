/**
 * Internal Dependencies
 */
import { getPlan, findPlansKeys } from 'lib/plans';
import { TYPE_PERSONAL } from 'lib/plans/constants';
import { getPlanRawPrice } from 'state/plans/selectors';

import { getUserPurchases } from './get-user-purchases';

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

export const getDowngradePlanFromPurchase = ( purchase ) => {
	const plan = getPlan( purchase.productSlug );
	if ( ! plan ) {
		return null;
	}

	const newPlanKeys = findPlansKeys( {
		group: plan.group,
		type: TYPE_PERSONAL,
		term: plan.term,
	} );

	return getPlan( newPlanKeys[ 0 ] );
};

export const getDowngradePlanRawPrice = ( state, purchase ) => {
	const plan = getDowngradePlanFromPurchase( purchase );
	if ( ! plan ) {
		return null;
	}
	return getPlanRawPrice( state, plan.getProductId() );
};

/**
 * Does the user have any current purchases?
 *
 * @param   {object}  state       global state
 * @param   {number}  userId      the user id
 * @returns {boolean} if the user currently has any purchases.
 */
export const isUserPaid = ( state, userId ) =>
	state.purchases.hasLoadedUserPurchasesFromServer && 0 < getUserPurchases( state, userId ).length;

export const isFetchingUserPurchases = ( state ) => state.purchases.isFetchingUserPurchases;
export const isFetchingSitePurchases = ( state ) => state.purchases.isFetchingSitePurchases;
export const hasLoadedUserPurchasesFromServer = ( state ) =>
	state.purchases.hasLoadedUserPurchasesFromServer;
export const hasLoadedSitePurchasesFromServer = ( state ) =>
	state.purchases.hasLoadedSitePurchasesFromServer;
