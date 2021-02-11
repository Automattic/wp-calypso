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

const whatsNewList: Reducer< WhatsNewState | undefined, Action > = ( state = {}, action ) => {
	if ( action.type === 'WHATS_NEW_LIST_RECEIVE' ) {
		return {
			...state,
			list: action.list,
		};
	}
	return state;
};

const reducer = combineReducers( { whatsNewList } );

export type State = ReturnType< typeof reducer >;

export default reducer;
