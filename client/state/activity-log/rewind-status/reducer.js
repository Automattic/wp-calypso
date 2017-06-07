/**
 * Internal dependencies
 */
import { itemsSchema } from './schema';
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

export const items = createReducer( {}, {
	[ REWIND_STATUS_UPDATE ]: keyedReducer( 'siteId', ( state, { status } ) => status ),
}, itemsSchema );

export default combineReducers( {
	errors,
	items,
} );
