/**
 * Internal dependencies
 */
import { rewindStatusSchema } from './schema';
import {
	REWIND_ACTIVATE_SUCCESS,
	REWIND_STATUS_ERROR,
	REWIND_STATUS_UPDATE,
} from 'state/action-types';
import {
	createReducer,
	keyedReducer,
} from 'state/utils';

export const rewindStatus = keyedReducer( 'siteId', createReducer( undefined, {
	[ REWIND_STATUS_ERROR ]: () => undefined,
	[ REWIND_STATUS_UPDATE ]: ( state, { status } ) => status,
	[ REWIND_ACTIVATE_SUCCESS ]: ( state ) => ( {
		...state,
		active: true,
	} ),
} ) );
rewindStatus.schema = rewindStatusSchema;

export const rewindStatusError = keyedReducer( 'siteId', createReducer( undefined, {
	[ REWIND_STATUS_ERROR ]: ( state, { error } ) => error,
	[ REWIND_STATUS_UPDATE ]: () => undefined,
} ) );
