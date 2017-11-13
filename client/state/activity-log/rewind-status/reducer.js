/** @format */

/**
 * Internal dependencies
 */

import { rewindStatusSchema } from './schema';
import {
	REWIND_ACTIVATE_SUCCESS,
	REWIND_STATUS_ERROR,
	REWIND_STATUS_UPDATE,
} from 'state/action-types';
import { keyedReducer } from 'state/utils';

export const rewindStatusItem = ( state = undefined, { type, status } ) => {
	switch ( type ) {
		case REWIND_STATUS_ERROR:
			return undefined;

		case REWIND_STATUS_UPDATE:
			return status;

		case REWIND_ACTIVATE_SUCCESS:
			return { ...state, active: true };

		default:
			return state;
	}
};
export const rewindStatus = keyedReducer( 'siteId', rewindStatusItem );
rewindStatus.schema = rewindStatusSchema;

export const rewindStatusErrorItem = ( state = undefined, { type, error } ) => {
	switch ( type ) {
		case REWIND_STATUS_ERROR:
			return error;

		case REWIND_STATUS_UPDATE:
			return undefined;

		default:
			return state;
	}
};

export const rewindStatusError = keyedReducer( 'siteId', rewindStatusErrorItem );
