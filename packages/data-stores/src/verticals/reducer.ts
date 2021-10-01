import { combineReducers } from '@wordpress/data';
import type { Action } from './actions';
import type { Vertical } from './types';
import type { Reducer } from 'redux';

const verticals: Reducer< Vertical[], Action > = ( state = [], action ) => {
	if ( action.type === 'RECEIVE_VERTICALS' ) {
		return action.verticals;
	}
	return state;
};

const reducer = combineReducers( { verticals } );

export type State = ReturnType< typeof reducer >;

export default reducer;
