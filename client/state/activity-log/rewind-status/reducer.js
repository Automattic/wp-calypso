/**
 * Internal dependencies
 */
import {
	REWIND_STATUS_ERROR,
	REWIND_STATUS_UPDATE,
} from 'state/action-types';
import {
	combineReducers,
	createReducer,
	keyedReducer,
} from 'state/utils';

export const errors = createReducer( {}, {
	[ REWIND_STATUS_ERROR ]: keyedReducer( 'siteId', ( state, { error } ) => error ),
} );

// FIXME: Add persistence scehma
export const items = createReducer( {}, {
	[ REWIND_STATUS_UPDATE ]: keyedReducer( 'siteId', ( state, { status } ) => status ),
} );

export default combineReducers( {
	errors,
	items,
} );
