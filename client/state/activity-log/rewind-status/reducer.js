/**
 * Internal dependencies
 */
import { rewindStatusSchema } from './schema';
import {
	REWIND_STATUS_ERROR,
	REWIND_STATUS_UPDATE,
} from 'state/action-types';
import {
	createReducer,
	keyedReducer,
} from 'state/utils';

export const rewindStatus = createReducer( {}, {
	[ REWIND_STATUS_ERROR ]: keyedReducer( 'siteId', () => null ),
	[ REWIND_STATUS_UPDATE ]: keyedReducer( 'siteId', ( state, { status } ) => status ),
}, rewindStatusSchema );

export const rewindStatusError = createReducer( {}, {
	[ REWIND_STATUS_ERROR ]: keyedReducer( 'siteId', ( state, { error } ) => error ),
	[ REWIND_STATUS_UPDATE ]: keyedReducer( 'siteId', () => null ),
} );
