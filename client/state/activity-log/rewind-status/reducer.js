/**
 * Internal dependencies
 */
import { rewindStatusSchema } from './schema';
import {
	REWIND_STATUS_ERROR,
	REWIND_STATUS_UPDATE,
} from 'state/action-types';
import { keyedReducer } from 'state/utils';

export const rewindStatus = keyedReducer( 'siteId', ( state = undefined, { type, status } ) => {
	switch ( type ) {
		case REWIND_STATUS_ERROR:
			return undefined;
		case REWIND_STATUS_UPDATE:
			return status;
		default:
			return state;
	}
} );
rewindStatus.schema = rewindStatusSchema;

export const rewindStatusError = keyedReducer( 'siteId', ( state = undefined, { type, error } ) => {
	switch ( type ) {
		case REWIND_STATUS_ERROR:
			return error;
		case REWIND_STATUS_UPDATE:
			return undefined;
		default:
			return state;
	}
} );
