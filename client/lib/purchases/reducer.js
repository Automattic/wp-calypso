/** @format */
/**
 * External Dependencies
 */
import { assign, find, matches } from 'lodash';

/**
 * Internal Dependencies
 */
import { action as ActionTypes } from 'lib/upgrades/constants';

/**
 * Constants
 */
const initialState = {
	data: [],
	error: null,
	isFetchingSitePurchases: false,
	isFetchingUserPurchases: false,
	hasLoadedSitePurchasesFromServer: false,
	hasLoadedUserPurchasesFromServer: false,
};

function updatePurchaseById( state, id, properties ) {
	return assign( {}, state, {
		data: state.data.map( purchase => {
			if ( id === purchase.id ) {
				return assign( {}, purchase, properties );
			}
			return purchase;
		} ),
	} );
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
		if ( ! find( purchases, { id: purchase.id } ) ) {
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
		if ( matches( predicate )( purchase ) && find( newPurchases, { id: purchase.id } ) ) {
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

	if ( ActionTypes.PURCHASES_SITE_FETCH_COMPLETED === action.type ) {
		predicate = { siteId: action.siteId };
	}

	if (
		ActionTypes.PURCHASES_USER_FETCH_COMPLETED === action.type ||
		ActionTypes.PURCHASE_REMOVE_COMPLETED === action.type
	) {
		predicate = { userId: action.userId };
	}

	purchases = removeMissingPurchasesByPredicate( existingPurchases, action.purchases, predicate );
	purchases = overwriteExistingPurchases( purchases, action.purchases );

	return purchases;
}

const reducer = ( state, payload ) => {
	const { action } = payload;

	switch ( action.type ) {
		case ActionTypes.PURCHASES_REMOVE:
			return assign( {}, state, {
				data: [],
				hasLoadedSitePurchasesFromServer: false,
				hasLoadedUserPurchasesFromServer: false,
			} );
		case ActionTypes.PURCHASE_REMOVE:
			return assign( {}, state, {
				data: [],
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false,
			} );
		case ActionTypes.PURCHASES_SITE_FETCH:
			return assign( {}, state, { isFetchingSitePurchases: true } );
		case ActionTypes.PURCHASES_USER_FETCH:
			return assign( {}, state, { isFetchingUserPurchases: true } );

		case ActionTypes.PURCHASE_REMOVE_COMPLETED:
			return assign( {}, state, {
				data: updatePurchases( state.data, action ),
				error: null,
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false,
				hasLoadedSitePurchasesFromServer: true,
				hasLoadedUserPurchasesFromServer: true,
			} );
		case ActionTypes.PURCHASES_SITE_FETCH_COMPLETED:
			return assign( {}, state, {
				data: updatePurchases( state.data, action ),
				error: null,
				isFetchingSitePurchases: false,
				hasLoadedSitePurchasesFromServer: true,
			} );
		case ActionTypes.PURCHASES_USER_FETCH_COMPLETED:
			return assign( {}, state, {
				data: updatePurchases( state.data, action ),
				error: null,
				isFetchingUserPurchases: false,
				hasLoadedUserPurchasesFromServer: true,
			} );

		case ActionTypes.PURCHASE_REMOVE_FAILED:
		case ActionTypes.PURCHASES_SITE_FETCH_FAILED:
		case ActionTypes.PURCHASES_USER_FETCH_FAILED:
			return assign( {}, state, { error: action.error } );

		case ActionTypes.PRIVACY_PROTECTION_CANCEL_COMPLETED:
			return updatePurchaseById( state, action.purchase.id, action.purchase );

		case ActionTypes.PRIVACY_PROTECTION_CANCEL_FAILED:
			return updatePurchaseById( state, action.purchaseId, {
				error: action.error,
			} );

		default:
			return state;
	}
};

export { initialState, reducer };
