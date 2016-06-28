// External dependencies
import assign from 'lodash/assign';
import find from 'lodash/find';

export const getByPurchaseId = ( state, id ) => (
	assign( {}, state, { data: find( state.data, { id } ) } )
);

export const isFetchingUserPurchases = state => state.purchases.isFetchingUserPurchases;
export const isFetchingSitePurchases = state => state.purchases.isFetchingSitePurchases;
