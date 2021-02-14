/**
 * External dependencies
 */
import type { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import type { WhatsNewState } from './types';
import type { Action } from './actions';

const list: Reducer< WhatsNewState[], Action > = ( state = [], action ) => {
	if ( action.type === 'WHATS_NEW_LIST_RECEIVE' ) {
		return {
			...state,
			list: action.list,
		};
	}
	return state;
};

const reducer = combineReducers( { list } );

export type State = ReturnType< typeof reducer >;

export default reducer;
