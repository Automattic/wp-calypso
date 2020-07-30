/**
 * External dependencies
 */
import { find, some } from 'lodash';

/**
 * Internal Dependencies
 */
import { isSubscription } from 'lib/purchases';
import {
	getIncludedDomainPurchaseAmount,
	isDomainRegistration,
	isDomainMapping,
	isJetpackBackup,
	isJetpackScan,
	isJetpackProduct,
} from 'lib/products-values';
import { getPlan, findPlansKeys } from 'lib/plans';
import { TYPE_PERSONAL } from 'lib/plans/constants';
import { getPlanRawPrice } from 'state/plans/selectors';

import { getUserPurchases } from './get-user-purchases';
import { getSitePurchases } from './get-site-purchases';

import 'state/purchases/init';

export { getPurchases } from './get-purchases';
export { getUserPurchases } from './get-user-purchases';
export { getPurchasesError } from './get-purchases-error';
export { getByPurchaseId } from './get-by-purchase-id';
export { getSitePurchases } from './get-site-purchases';
export { getRenewableSitePurchases } from './get-renewable-site-purchases';

/**
 * Returns whether or not a Site has an active purchase of a Jetpack product.
 *
 * @param {object} state global state
 * @param {number} siteId the site id
 * @returns {boolean} True if the site has an active Jetpack purchase, false otherwise.
 */
export const siteHasJetpackProductPurchase = ( state, siteId ) => {
	return some(
		getSitePurchases( state, siteId ),
		( purchase ) => purchase.active && isJetpackProduct( purchase )
	);
};

/**
 * Whether a site has an active Jetpack backup purchase.
 *
 * @param   {object} state       global state
 * @param   {number} siteId      the site id
 * @returns {boolean} True if the site has an active Jetpack Backup purchase, false otherwise.
 */
export const siteHasBackupProductPurchase = ( state, siteId ) => {
	return some(
		getSitePurchases( state, siteId ),
		( purchase ) => purchase.active && isJetpackBackup( purchase )
	);
};

/**
 * Whether a site has an active Jetpack Scan purchase.
 *
 * @param   {object} state       global state
 * @param   {number} siteId      the site id
 * @returns {boolean} True if the site has an active Jetpack Scan purchase, false otherwise.
 */
export const siteHasScanProductPurchase = ( state, siteId ) => {
	return some(
		getSitePurchases( state, siteId ),
		( purchase ) => purchase.active && isJetpackScan( purchase )
	);
};

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
