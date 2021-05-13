/**
 * Internal dependencies
 */
import {
	REWIND_RESTORE,
	REWIND_RESTORE_DISMISS,
	REWIND_RESTORE_DISMISS_PROGRESS,
	REWIND_RESTORE_REQUEST,
	REWIND_RESTORE_UPDATE_PROGRESS,
} from 'calypso/state/action-types';
import { keyedReducer } from 'calypso/state/utils';

const startProgress = ( state, { timestamp } ) => ( {
	errorCode: '',
	failureReason: '',
	message: '',
	percent: 0,
	status: 'queued',
	timestamp,
	rewindId: '',
} );

const updateProgress = (
	state,
	{
		errorCode,
		failureReason,
		message,
		percent,
		restoreId,
		status,
		timestamp,
		rewindId,
		context,
		currentEntry,
	}
) => ( {
	errorCode,
	failureReason,
	message,
	percent,
	restoreId,
	status,
	timestamp,
	rewindId,
	context,
	currentEntry,
} );

export const restoreProgress = keyedReducer( 'siteId', ( state = {}, action ) => {
	switch ( action.type ) {
		case REWIND_RESTORE:
			return startProgress( state, action );
		case REWIND_RESTORE_DISMISS_PROGRESS:
			return null;
		case REWIND_RESTORE_UPDATE_PROGRESS:
			return updateProgress( state, action );
		case REWIND_RESTORE_DISMISS:
			return null;
	}

	return state;
} );

export const restoreRequest = keyedReducer( 'siteId', ( state = null, action ) => {
	switch ( action.type ) {
		case REWIND_RESTORE:
			return null;
		case REWIND_RESTORE_DISMISS:
			return null;
		case REWIND_RESTORE_REQUEST:
			return action.activityId;
	}

	return state;
} );
