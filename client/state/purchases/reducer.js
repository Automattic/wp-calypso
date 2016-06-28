/**
 * External Dependencies
 */
import find from 'lodash/find';
import matches from 'lodash/matches';

/**
 * Internal Dependencies
 */
import {
	PURCHASES_REMOVE,
	PURCHASE_REMOVE,
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
			if ( id === purchase.id ) {
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

	if ( PURCHASES_SITE_FETCH_COMPLETED === action.type ) {
		predicate = { siteId: action.siteId };
	}

	if ( PURCHASES_USER_FETCH_COMPLETED === action.type ||
		PURCHASE_REMOVE_COMPLETED === action.type ) {
		predicate = { userId: action.userId };
	}

	purchases = removeMissingPurchasesByPredicate( existingPurchases, action.purchases, predicate );
	purchases = overwriteExistingPurchases( purchases, action.purchases );

	return purchases;
}

export const items = ( state = initialState, action ) => {
	const { type } = action;

	switch ( type ) {
		case PURCHASES_REMOVE:
			return { ...state,
				data: [],
				hasLoadedSitePurchasesFromServer: false,
				hasLoadedUserPurchasesFromServer: false
			};
		case PURCHASE_REMOVE:
			return { ...state,
				data: [],
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false
			};
		case PURCHASES_SITE_FETCH:
			return { ...state, isFetchingSitePurchases: true };
		case PURCHASES_USER_FETCH:
			return { ...state, isFetchingUserPurchases: true };

		case PURCHASE_REMOVE_COMPLETED:
			return { ...state,
				data: updatePurchases( state.data, action ),
				error: null,
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false,
				hasLoadedSitePurchasesFromServer: true,
				hasLoadedUserPurchasesFromServer: true
			};
		case PURCHASES_SITE_FETCH_COMPLETED:
			return { ...state,
				data: updatePurchases( state.data, action ),
				error: null,
				isFetchingSitePurchases: false,
				hasLoadedSitePurchasesFromServer: true
			};
		case PURCHASES_USER_FETCH_COMPLETED:
			return { ...state,
				data: updatePurchases( state.data, action ),
				error: null,
				isFetchingUserPurchases: false,
				hasLoadedUserPurchasesFromServer: true
			};

		case PURCHASE_REMOVE_FAILED:
		case PURCHASES_SITE_FETCH_FAILED:
		case PURCHASES_USER_FETCH_FAILED:
			return { ...state, error: action.error };

		case PRIVACY_PROTECTION_CANCEL_COMPLETED:
			return updatePurchaseById( state, action.purchase.id, action.purchase );

		case PRIVACY_PROTECTION_CANCEL_FAILED:
			return updatePurchaseById( state, action.purchaseId, {
				error: action.error
			} );

		default:
			return state;
	}
};
