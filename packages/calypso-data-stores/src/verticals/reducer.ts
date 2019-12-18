/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ActionType, Vertical } from './types';
import * as Actions from './actions';

const verticals: Reducer< Vertical[], ReturnType< typeof Actions[ 'receiveVerticals' ] > > = (
	state = [],
	action
) => {
	if ( action.type === ActionType.RECEIVE_VERTICALS ) {
		return action.verticals;
	}
	return state;
};

const reducer = combineReducers( { verticals } );

export type State = ReturnType< typeof reducer >;

export default reducer;
