/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { combineReducers, registerStore } from '@wordpress/data';
import type { Reducer } from 'redux';
import type { DispatchFromMap, SelectFromMap } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { actions, Action } from './actions';
import { STORE_KEY } from './constants';

const opened: Reducer< boolean, Action > = ( state = false, action ) => {
	switch ( action.type ) {
		case 'TOGGLE_SIDEBAR':
			return ! state;

		default:
			return state;
	}
};

const reducer = combineReducers( { opened } );

type State = ReturnType< typeof reducer >;

const selectors = {
	isSidebarOpened: ( state: State ) => state.opened,
};

registerStore( STORE_KEY, {
	actions,
	reducer,
	selectors,
} );

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
