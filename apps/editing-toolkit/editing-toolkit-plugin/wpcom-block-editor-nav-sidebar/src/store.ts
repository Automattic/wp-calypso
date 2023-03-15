import { combineReducers, register, createReduxStore } from '@wordpress/data';
import { actions, Action } from './actions';
import { STORE_KEY } from './constants';
import type { Reducer } from 'redux';

const opened: Reducer< boolean, Action > = ( state = false, action ) => {
	switch ( action.type ) {
		case 'TOGGLE_SIDEBAR':
			return ! state;

		default:
			return state;
	}
};

const closing: Reducer< boolean, Action > = ( state = false, action ) => {
	switch ( action.type ) {
		case 'SET_SIDEBAR_CLOSING':
			return action.isClosing;

		default:
			return state;
	}
};

const reducer = combineReducers( { opened, closing } );

type State = ReturnType< typeof reducer >;

export const selectors = {
	isSidebarOpened: ( state: State ) => state.opened,
	isSidebarClosing: ( state: State ) => state.closing,
};

export const store = createReduxStore( STORE_KEY, {
	actions,
	reducer,
	selectors,
} );

register( store );
