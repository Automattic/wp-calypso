/**
 * External dependencies
 */
import type { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import type { Vertical } from './types';
import type { Action } from './actions';

const verticals: Reducer< Vertical[], Action > = ( state = [], action ) => {
	if ( action.type === 'RECEIVE_VERTICALS' ) {
		return action.verticals;
	}
	return state;
};

const reducer = combineReducers( { verticals } );

export type State = ReturnType< typeof reducer >;

export default reducer;
