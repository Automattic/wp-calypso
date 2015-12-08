/**
 * External Dependencies
 */
import assign from 'lodash/object/assign';
import find from 'lodash/collection/find';

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
	isFetching: false,
	hasLoadedFromServer: false
};

function updatePurchaseById( state, id, properties ) {
	return assign( {}, state, {
		data: state.data.map( purchase => {
			if ( id === purchase.id ) {
				return assign( {}, purchase, properties );
			}
			return purchase;
		} )
	} );
}

const reducer = ( state, payload ) => {
	const { action } = payload;

	switch ( action.type ) {
		case ActionTypes.PURCHASES_SITE_FETCH:
		case ActionTypes.PURCHASES_USER_FETCH:
			return assign( {}, state, { isFetching: true } );

		case ActionTypes.PURCHASES_SITE_FETCH_COMPLETED:
		case ActionTypes.PURCHASES_USER_FETCH_COMPLETED:
			let { purchases } = action;

			state.data.forEach( purchase => {
				if ( ! find( purchases, { id: purchase.id } ) ) {
					purchases = purchases.concat( purchase );
				}
			} );

			return assign( {}, state, {
				data: purchases,
				error: null,
				isFetching: false,
				hasLoadedFromServer: true
			} );

		case ActionTypes.PURCHASES_SITE_FETCH_FAILED:
		case ActionTypes.PURCHASES_USER_FETCH_FAILED:
			return assign( {}, state, { error: action.error } );

		case ActionTypes.PRIVACY_PROTECTION_CANCEL_COMPLETED:
			return updatePurchaseById( state, action.purchase.id, action.purchase );

		case ActionTypes.PRIVACY_PROTECTION_CANCEL_FAILED:
			return updatePurchaseById( state, action.purchaseId, {
				error: action.error
			} );

		default:
			return state;
	}
};

export {
	initialState,
	reducer
};
