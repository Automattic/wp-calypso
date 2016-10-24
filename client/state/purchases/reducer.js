/**
 * External Dependencies
 */
import find from 'lodash/find';
import matches from 'lodash/matches';

/**
 * Internal Dependencies
 */
import { createReducer } from 'state/utils';
import {
	PURCHASES_REMOVE,
	PURCHASES_SITE_FETCH,
	PURCHASES_USER_FETCH,
	PURCHASE_REMOVE_COMPLETED,
	PURCHASES_SITE_FETCH_COMPLETED,
	PURCHASES_USER_FETCH_COMPLETED,
	PURCHASE_REMOVE_FAILED,
	PURCHASES_SITE_FETCH_FAILED,
	PURCHASES_USER_FETCH_FAILED,
	PRIVACY_PROTECTION_CANCEL_COMPLETED,
	PRIVACY_PROTECTION_CANCEL_FAILED
} from 'state/action-types';

/**
 * Constants
 */
const initialState = {
	data: [],
	error: null,
	isFetchingSitePurchases: false,
	isFetchingUserPurchases: false,
	hasLoadedSitePurchasesFromServer: false,
	hasLoadedUserPurchasesFromServer: false
};

function updatePurchaseById( state, id, properties ) {
	return {
		...state,
		data: state.data.map( purchase => {
			if ( id === purchase.ID ) {
				return { ...purchase, ...properties };
			}
			return purchase;
		} )
	};
}

/**
 * Overwrites the purchases in the store with the purchases from the new purchases array
 * that share the same `id` value.
 *
 * @param {array} existingPurchases - an array of purchases in the store
 * @param {array} newPurchases - an array of purchases fetched from the API
 * @return {array} An array of purchases
 */
function overwriteExistingPurchases( existingPurchases, newPurchases ) {
	let purchases = newPurchases;

	existingPurchases.forEach( purchase => {
		if ( ! find( purchases, { ID: purchase.ID } ) ) {
			purchases = purchases.concat( purchase );
		}
	} );

	return purchases;
}

/**
 * Removes purchases that are missing from the new purchases array and match the given predicate.
 *
 * @param {array} existingPurchases - an array of purchases in the store
 * @param {array} newPurchases - an array of purchases fetched from the API
 * @param {object} predicate - the predicate to check before removing the item from the array.
 * @return {array} An array of purchases
 */
function removeMissingPurchasesByPredicate( existingPurchases, newPurchases, predicate ) {
	return existingPurchases.filter( purchase => {
		if ( matches( predicate )( purchase ) && find( newPurchases, { ID: purchase.ID } ) ) {
			// this purchase is present in the new array
			return true;
		}

		if ( ! matches( predicate )( purchase ) ) {
			// only overwrite remove purchases that match the predicate
			return true;
		}

		// the purchase doesn't match the predicate or is missing from the array of new purchases
		return false;
	} );
}

function updatePurchases( existingPurchases, action ) {
	let purchases, predicate;

	if ( PURCHASES_SITE_FETCH_COMPLETED === action.type ) {
		predicate = { blog_id: String( action.siteId ) };
	}

	if ( PURCHASES_USER_FETCH_COMPLETED === action.type ||
		PURCHASE_REMOVE_COMPLETED === action.type ) {
		predicate = { user_id: String( action.userId ) };
	}

	purchases = removeMissingPurchasesByPredicate( existingPurchases, action.purchases, predicate );
	purchases = overwriteExistingPurchases( purchases, action.purchases );

	return purchases;
}

const assignError = ( state, action ) => ( { ...state, error: action.error } );

export default createReducer( initialState, {
	[ PURCHASES_REMOVE ]: ( state ) => ( {
		...state,
		data: [],
		hasLoadedSitePurchasesFromServer: false,
		hasLoadedUserPurchasesFromServer: false
	} ),

	[ PURCHASES_SITE_FETCH ]: ( state ) => ( { ...state, isFetchingSitePurchases: true } ),

	[ PURCHASES_USER_FETCH ]: ( state ) => ( { ...state, isFetchingUserPurchases: true } ),

	[ PURCHASE_REMOVE_COMPLETED ]: ( state, action ) => ( {
		...state,
		data: updatePurchases( state.data, action ),
		error: null,
		isFetchingSitePurchases: false,
		isFetchingUserPurchases: false,
		hasLoadedSitePurchasesFromServer: true,
		hasLoadedUserPurchasesFromServer: true
	} ),

	[ PURCHASES_SITE_FETCH_COMPLETED ]: ( state, action ) => ( {
		...state,
		data: updatePurchases( state.data, action ),
		error: null,
		isFetchingSitePurchases: false,
		hasLoadedSitePurchasesFromServer: true
	} ),

	[ PURCHASES_USER_FETCH_COMPLETED ]: ( state, action ) => ( {
		...state,
		data: updatePurchases( state.data, action ),
		error: null,
		isFetchingUserPurchases: false,
		hasLoadedUserPurchasesFromServer: true
	} ),

	[ PURCHASE_REMOVE_FAILED ]: assignError,
	[ PURCHASES_SITE_FETCH_FAILED ]: assignError,
	[ PURCHASES_USER_FETCH_FAILED ]: assignError,

	[ PRIVACY_PROTECTION_CANCEL_COMPLETED ]: ( state, action ) => updatePurchaseById( state, action.purchase.ID, action.purchase ),

	[ PRIVACY_PROTECTION_CANCEL_FAILED ]: ( state, action ) => updatePurchaseById( state, action.purchaseId, {
		error: action.error
	} )
} );
