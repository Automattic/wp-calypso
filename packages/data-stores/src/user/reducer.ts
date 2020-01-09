/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ActionType, User } from './types';
import * as Actions from './actions';

const user: Reducer< User, ReturnType< typeof Actions[ 'receiveUser' ] > > = (
	state = {},
	action
) => {
	if ( action.type === ActionType.RECEIVE_USER ) {
		return action.user;
	}
	return state;
};

const reducer = combineReducers( { user } );

export type State = ReturnType< typeof reducer >;

export default reducer;
