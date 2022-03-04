import { withStorageKey } from '@automattic/state-utils';
import { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';
import { combineReducers } from 'calypso/state/utils';
import type { Reducer, Action } from 'redux';

type ItemsAction =
	| {
			type: 'STORED_CARDS_ADD_COMPLETED';
			item: PaymentMethod;
	  }
	| {
			type: 'STORED_CARDS_FETCH_COMPLETED';
			list: PaymentMethod[];
	  };

export const items: Reducer< PaymentMethod[], ItemsAction > = ( state = [], action ) => {
	switch ( action.type ) {
		case 'STORED_CARDS_ADD_COMPLETED': {
			const { item } = action;
			return [ ...state, item ];
		}
		case 'STORED_CARDS_FETCH_COMPLETED': {
			const { list } = action;
			return list;
		}
	}

	return state;
};

type IsFetchingAction = Action<
	'STORED_CARDS_FETCH' | 'STORED_CARDS_FETCH_COMPLETED' | 'STORED_CARDS_FETCH_FAILED'
>;

export const isFetching: Reducer< boolean, IsFetchingAction > = ( state = false, action ) => {
	switch ( action.type ) {
		case 'STORED_CARDS_FETCH':
			return true;

		case 'STORED_CARDS_FETCH_COMPLETED':
		case 'STORED_CARDS_FETCH_FAILED':
			return false;
	}

	return state;
};

const combinedReducer = combineReducers( {
	items: items as Reducer,
	isFetching,
} );

export default withStorageKey( 'storedCards', combinedReducer );
