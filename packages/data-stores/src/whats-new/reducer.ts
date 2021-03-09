/**
 * External dependencies
 */
import type { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import type { WhatsNew } from './types';
import type { Action } from './actions';

const DEFAULT_STATE = {
	isActive: true,
};

const guide: Reducer< WhatsNew, Action > = ( state = DEFAULT_STATE, action ) => {
	if ( action.type === 'TOGGLE_FEATURE' ) {
		console.log( JSON.stringify( state ) );
		return {
			isActive: ! state.isActive,
		};
	}
	return state;
};

const reducer = combineReducers( { guide } );

export type State = ReturnType< typeof reducer >;

export default reducer;
