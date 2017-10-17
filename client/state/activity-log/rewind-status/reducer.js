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

export const rewindItem = ( state = undefined, { type, status } ) => {
	switch ( type ) {
		case REWIND_STATUS_ERROR:
			return undefined;

		case REWIND_STATUS_UPDATE:
			return status;

		case REWIND_ACTIVATE_SUCCESS:
			return { ...state, active: true };
	}

	return state;
};

export const rewindStatus = keyedReducer( 'siteId', rewindItem );
rewindStatus.schema = rewindStatusSchema;

export const rewindStatusErrorItem = ( state = undefined, { type, error } ) => {
	switch ( type ) {
		case REWIND_STATUS_ERROR:
			return error;

		case REWIND_STATUS_UPDATE:
			return undefined;
	}

	return state;
};

export const rewindStatusError = keyedReducer( 'siteId', rewindStatusErrorItem );
