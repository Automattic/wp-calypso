/**
 * Internal dependencies
 */
import { WHATS_NEW_LIST_SET } from 'calypso/state/action-types';
import { combineReducers, withStorageKey } from 'calypso/state/utils';

export const list = ( state = {}, action ) =>
	action.type === WHATS_NEW_LIST_SET ? action.list : state;

const combinedReducer = combineReducers( {
	list,
} );

export default withStorageKey( 'whatsNew', combinedReducer );
