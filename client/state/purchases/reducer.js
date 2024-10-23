import { withStorageKey } from '@automattic/state-utils';
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
	PURCHASES_SITE_RESET_STATE,
} from 'calypso/state/action-types';

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

function mergePurchase( existingPurchases, newPurchase ) {
	// Update any matching existing purchase in place.
	let foundMatch = false;
	const merged = existingPurchases.map( ( purchase ) => {
		if ( newPurchase.ID === purchase.ID ) {
			foundMatch = true;
			return newPurchase;
		}
		return purchase;
	} );
	if ( foundMatch ) {
		return merged;
	}
	// If there is no matching existing purchase, append the new purchase.
	return [ ...merged, newPurchase ];
}

/**
 * Merges a new array of purchases with the existing array and updates items
 * in-place if they change.
 * @param {Array} existingPurchases - an array of purchases in the store
 * @param {Array} newPurchases - an array of purchases fetched from the API
 * @returns {Array} An array of purchases
 */
function mergePurchases( existingPurchases, newPurchases ) {
	return newPurchases.reduce(
		( merged, newPurchase ) => mergePurchase( merged, newPurchase ),
		existingPurchases
	);
}

function updatePurchases( existingPurchases, action ) {
	// If the action is to update a user, replace all the data.
	if ( action.type === PURCHASES_USER_FETCH_COMPLETED ) {
		return action.purchases;
	}
	// If the action is to update a site, remove all existing purchases for that site that are not in the new purchases array.
	if ( action.type === PURCHASES_SITE_FETCH_COMPLETED ) {
		existingPurchases = existingPurchases.filter( ( purchase ) => {
			if ( parseInt( purchase.blog_id, 10 ) !== parseInt( action.siteId, 10 ) ) {
				return true;
			}
			if ( action.purchases.some( ( newPurchase ) => newPurchase.ID === purchase.ID ) ) {
				return true;
			}
			return false;
		} );
	}
	// If the action is to remove purchases, remove all existing purchases that are not in the new purchases array.
	if ( action.type === PURCHASE_REMOVE_COMPLETED ) {
		existingPurchases = existingPurchases.filter( ( purchase ) => {
			if ( action.purchases.some( ( newPurchase ) => newPurchase.ID === purchase.ID ) ) {
				return true;
			}
			return false;
		} );
	}
	return mergePurchases( existingPurchases, action.purchases );
}

const reducer = ( state = initialState, action ) => {
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
			return {
				...state,
				error: action.error,
				hasLoadedSitePurchasesFromServer: true,
				hasLoadedUserPurchasesFromServer: true,
			};
		case PURCHASES_SITE_FETCH_FAILED:
			return {
				...state,
				error: action.error,
				hasLoadedSitePurchasesFromServer: true,
				isFetchingSitePurchases: false,
			};
		case PURCHASES_USER_FETCH_FAILED:
			return {
				...state,
				error: action.error,
				hasLoadedUserPurchasesFromServer: true,
				isFetchingUserPurchases: false,
			};
		case PURCHASES_SITE_RESET_STATE:
			return {
				...state,
				hasLoadedSitePurchasesFromServer: false,
				isFetchingSitePurchases: false,
			};
	}

	return state;
};

export { reducer };

export default withStorageKey( 'purchases', reducer );
