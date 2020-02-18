/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { Vertical } from './types';
import { Action } from './actions';

const verticals: Reducer< Vertical[], Action > = ( state = [], action ) => {
	if ( action.type === 'RECEIVE_VERTICALS' ) {
		return action.verticals;
	}
	return state;
};

const reducer = combineReducers( { verticals } );

export type State = ReturnType< typeof reducer >;

export default reducer;
