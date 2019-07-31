/** @format */

/**
 * External dependencies
 */
import { get, find } from 'lodash';

/**
 * Internal Dependencies
 */
import createSelector from 'lib/create-selector';
import { createPurchasesArray } from 'lib/purchases/assembler';
import { isSubscription } from 'lib/purchases';
import {
	getIncludedDomainPurchaseAmount,
	isDomainRegistration,
	isDomainMapping,
} from 'lib/products-values';
import { getPlan, findPlansKeys } from 'lib/plans';
import { TYPE_PERSONAL } from 'lib/plans/constants';
import { getPlanRawPrice } from 'state/plans/selectors';
/**
 * Return the list of purchases from state object
 *
 * @param {Object} state - current state object
 * @return {Array} Purchases
 */
export const getPurchases = createSelector(
	state => createPurchasesArray( state.purchases.data ),
	state => [ state.purchases.data ]
);

/**
 * Returns a list of Purchases associated with a User from the state using its userId
 * @param  {Object} state       global state
 * @param  {Number} userId      the user id
 * @return {Object} the matching purchases if there are some
 */
export const getUserPurchases = ( state, userId ) =>
	state.purchases.hasLoadedUserPurchasesFromServer &&
	getPurchases( state ).filter( purchase => purchase.userId === userId );

/**
 * Returns the server error for site or user purchases (if there is one)
 *
 * @param {Object} state - current state object
 * @return {Object} an error object from the server
 */
export const getPurchasesError = state => get( state, 'purchases.error', '' );

/**
 * Returns a Purchase object from the state using its id
 * @param  {Object} state       global state
 * @param  {Number} purchaseId  the purchase id
 * @return {Object} the matching purchase if there is one
 */
export const getByPurchaseId = ( state, purchaseId ) =>
	getPurchases( state )
		.filter( purchase => purchase.id === purchaseId )
		.shift();

/**
 * Returns a list of Purchases associated with a Site from the state using its siteId
 * @param  {Object} state       global state
 * @param  {Number} siteId      the site id
 * @return {Object} the matching purchases if there are some
 */
export const getSitePurchases = ( state, siteId ) =>
	getPurchases( state ).filter( purchase => purchase.siteId === siteId );

/***
 * Returns a purchase object that corresponds to that subscription's included domain
 *
 * Even if a domain registration was purchased with the subscription, it will
 * not be returned if the domain product was paid for separately (eg: if it was
 * renewed on its own).
 *
 * @param  {Object} state  global state
 * @param  {Object} subscriptionPurchase  subscription purchase object
 * @return {Object} domain purchase if there is one, null if none found or not a subscription object passed
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
		purchase =>
			( isDomainMapping( purchase ) || isDomainRegistration( purchase ) ) &&
			includedDomain === purchase.meta
	);

	return domainPurchase;
};

export const getDowngradePlanFromPurchase = purchase => {
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
	return getPlanRawPrice( state, plan.getProductId(), false );
};

/**
 * Does the user have any current purchases?
 * @param  {Object}  state       global state
 * @param  {Number}  userId      the user id
 * @return {Boolean} if the user currently has any purchases.
 */
export const isUserPaid = ( state, userId ) =>
	state.purchases.hasLoadedUserPurchasesFromServer && 0 < getUserPurchases( state, userId ).length;

export const isFetchingUserPurchases = state => state.purchases.isFetchingUserPurchases;
export const isFetchingSitePurchases = state => state.purchases.isFetchingSitePurchases;
export const hasLoadedUserPurchasesFromServer = state =>
	state.purchases.hasLoadedUserPurchasesFromServer;
export const hasLoadedSitePurchasesFromServer = state =>
	state.purchases.hasLoadedSitePurchasesFromServer;
