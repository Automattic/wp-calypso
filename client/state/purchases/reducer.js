/**
 * External dependencies
 */
import { find, matches } from 'lodash';

/**
 * Internal Dependencies
 */
import { withoutPersistence } from 'state/utils';
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
	hasLoadedUserPurchasesFromServer: false,
};

/**
 * Overwrites the purchases in the store with the purchases from the new purchases array
 * that share the same `id` value.
 *
 * @param {Array} existingPurchases - an array of purchases in the store
 * @param {Array} newPurchases - an array of purchases fetched from the API
 * @returns {Array} An array of purchases
 */
function overwriteExistingPurchases( existingPurchases, newPurchases ) {
	let purchases = newPurchases;

	existingPurchases.forEach( ( purchase ) => {
		if ( ! find( purchases, { ID: purchase.ID } ) ) {
			purchases = purchases.concat( purchase );
		}
	} );

	return purchases;
}

/**
 * Removes purchases that are missing from the new purchases array and match the given predicate.
 *
 * @param {Array} existingPurchases - an array of purchases in the store
 * @param {Array} newPurchases - an array of purchases fetched from the API
 * @param {object} predicate - the predicate to check before removing the item from the array.
 * @returns {Array} An array of purchases
 */
function removeMissingPurchasesByPredicate( existingPurchases, newPurchases, predicate ) {
	return existingPurchases.filter(
		( purchase ) => ! matches( predicate )( purchase ) || find( newPurchases, { ID: purchase.ID } )
	);
}

function updatePurchases( existingPurchases, action ) {
	let purchases, predicate;

	if ( PURCHASES_SITE_FETCH_COMPLETED === action.type ) {
		predicate = { blog_id: String( action.siteId ) };
	}

	if (
		PURCHASES_USER_FETCH_COMPLETED === action.type ||
		PURCHASE_REMOVE_COMPLETED === action.type
	) {
		predicate = { user_id: String( action.userId ) };
	}

	purchases = removeMissingPurchasesByPredicate( existingPurchases, action.purchases, predicate );
	purchases = overwriteExistingPurchases( purchases, action.purchases );

	return purchases;
}

const assignError = ( state, action ) => ( { ...state, error: action.error } );

export default withoutPersistence( ( state = initialState, action ) => {
	switch ( action.type ) {
		case PURCHASES_REMOVE:
			return {
				...state,
				data: [],
				hasLoadedSitePurchasesFromServer: false,
				hasLoadedUserPurchasesFromServer: false,
			};
		case PURCHASES_SITE_FETCH:
			return { ...state, isFetchingSitePurchases: true };
		case PURCHASES_USER_FETCH:
			return { ...state, isFetchingUserPurchases: true };
		case PURCHASE_REMOVE_COMPLETED:
			return {
				...state,
				data: updatePurchases( state.data, action ),
				error: null,
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false,
				hasLoadedSitePurchasesFromServer: true,
				hasLoadedUserPurchasesFromServer: true,
			};
		case PURCHASES_SITE_FETCH_COMPLETED:
			return {
				...state,
				data: updatePurchases( state.data, action ),
				error: null,
				isFetchingSitePurchases: false,
				hasLoadedSitePurchasesFromServer: true,
			};
		case PURCHASES_USER_FETCH_COMPLETED:
			return {
				...state,
				data: updatePurchases( state.data, action ),
				error: null,
				isFetchingUserPurchases: false,
				hasLoadedUserPurchasesFromServer: true,
			};
		case PURCHASE_REMOVE_FAILED:
			return assignError( state, action );
		case PURCHASES_SITE_FETCH_FAILED:
			return assignError( state, action );
		case PURCHASES_USER_FETCH_FAILED:
			return assignError( state, action );
	}

	return state;
} );
