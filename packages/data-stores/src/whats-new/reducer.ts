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

export const guide: Reducer< WhatsNew, Action > = ( state = DEFAULT_STATE, action ) => {
	if ( action.type === 'TOGGLE_FEATURE' ) {
		return {
			isActive: ! state.isActive,
		};
	}
	return state;
};

const reducer = combineReducers( { guide } );

export type State = ReturnType< typeof reducer >;

export default reducer;
