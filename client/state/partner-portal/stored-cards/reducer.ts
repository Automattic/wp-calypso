import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import type { AnyAction } from 'redux';

export const items = ( state = [], action: AnyAction ) => {
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

export const isFetching = ( state = false, action: AnyAction ) => {
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
	isFetching,
	items,
} );

export default withStorageKey( 'storedCards', combinedReducer );
