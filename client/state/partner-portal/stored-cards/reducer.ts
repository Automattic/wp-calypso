import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';
import type { Reducer, Action, UnknownAction } from 'redux';

type ItemsAction =
	| {
			type: 'STORED_CARDS_DELETE_COMPLETED';
			card: PaymentMethod;
	  }
	| {
			type: 'STORED_CARDS_UPDATE_IS_PRIMARY_COMPLETED';
			payment_method_id: string;
	  }
	| {
			type: 'STORED_CARDS_FETCH_COMPLETED';
			list: PaymentMethod[];
	  };

export const items: Reducer< PaymentMethod[], ItemsAction > = ( state = [], action ) => {
	switch ( action.type ) {
		case 'STORED_CARDS_FETCH_COMPLETED': {
			const { list } = action;
			return list;
		}
		case 'STORED_CARDS_DELETE_COMPLETED': {
			const { card } = action;
			return state.filter( ( item ) => item.id !== card.id );
		}
		case 'STORED_CARDS_UPDATE_IS_PRIMARY_COMPLETED': {
			const { payment_method_id } = action;
			return state.map( ( item ) => {
				if ( item.id === payment_method_id ) {
					return { ...item, is_default: true };
				}
				return item;
			} );
		}
	}

	return state;
};

type ItemsPerPageAction = {
	type: 'STORED_CARDS_ITEMS_PER_PAGE';
	perPage: number;
};

export const itemsPerPage: Reducer< number, ItemsPerPageAction > = ( state = 30, action ) => {
	switch ( action?.type ) {
		case 'STORED_CARDS_ITEMS_PER_PAGE': {
			const { perPage } = action;
			return perPage;
		}
	}
	return state;
};

type MoreItemsAction = {
	type: 'STORED_CARDS_HAS_MORE_ITEMS';
	hasMore: boolean;
};

export const hasMoreItems: Reducer< boolean, MoreItemsAction > = ( state = false, action ) => {
	switch ( action.type ) {
		case 'STORED_CARDS_HAS_MORE_ITEMS': {
			const { hasMore } = action;
			return Boolean( hasMore );
		}
	}

	return state;
};

type FetchingActionStatus = Action<
	'STORED_CARDS_FETCH' | 'STORED_CARDS_FETCH_COMPLETED' | 'STORED_CARDS_FETCH_FAILED'
>;

export const isFetching: Reducer< boolean, FetchingActionStatus | UnknownAction > = (
	state = false,
	action
) => {
	switch ( action.type ) {
		case 'STORED_CARDS_FETCH':
			return true;

		case 'STORED_CARDS_FETCH_COMPLETED':
		case 'STORED_CARDS_FETCH_FAILED':
			return false;
	}

	return state;
};

type DeletingActionStatus =
	| {
			type: 'STORED_CARDS_DELETE';
			card: PaymentMethod;
	  }
	| {
			type: 'STORED_CARDS_DELETE_FAILED';
			card: PaymentMethod;
	  }
	| {
			type: 'STORED_CARDS_DELETE_COMPLETED';
			card: PaymentMethod;
	  };

export const isDeleting: Reducer< { [ key: string ]: boolean }, DeletingActionStatus > = (
	state = {},
	action
) => {
	switch ( action.type ) {
		case 'STORED_CARDS_DELETE':
			return {
				...state,
				[ action.card.id ]: true,
			};

		case 'STORED_CARDS_DELETE_FAILED':
		case 'STORED_CARDS_DELETE_COMPLETED': {
			const nextState = { ...state };
			delete nextState[ action.card.id ];
			return nextState;
		}
	}

	return state;
};

const combinedReducer = combineReducers( {
	items: items as Reducer,
	itemsPerPage: itemsPerPage as Reducer,
	isDeleting: isDeleting as Reducer,
	isFetching,
	hasMoreItems: hasMoreItems as Reducer,
} );

export default withStorageKey( 'storedCards', combinedReducer );
