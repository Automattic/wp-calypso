/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ActionType, Vertical, VerticalsActions } from './types';

const verticals: Reducer< Vertical[], VerticalsActions > = ( state = [], action ) => {
	if ( action.type === ActionType.RECEIVE_VERTICALS ) {
		return action.verticals;
	}
	return state;
};

const reducer = combineReducers( { verticals } );

export type State = ReturnType< typeof reducer >;

export default reducer;
