/**
 * External dependencies
 */
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { Vertical } from './types';

function verticals( state: Vertical[] = [], action: import('./actions').Action ) {
	if ( action.type === 'RECEIVE_VERTICALS' ) {
		return action.verticals;
	}
	return state;
}

const reducer = combineReducers( { verticals } );

export type State = ReturnType< typeof reducer >;

export default reducer;
