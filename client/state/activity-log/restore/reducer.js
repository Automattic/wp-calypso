/** @format */
/**
 * Internal dependencies
 */
import { restoreProgressSchema } from './schema';
import {
	REWIND_RESTORE,
	REWIND_RESTORE_DISMISS,
	REWIND_RESTORE_DISMISS_PROGRESS,
	REWIND_RESTORE_REQUEST,
	REWIND_RESTORE_UPDATE_PROGRESS,
} from 'state/action-types';
import { createReducer, keyedReducer } from 'state/utils';

const stubNull = () => null;

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
	{ errorCode, failureReason, message, percent, restoreId, status, timestamp, rewindId }
) => ( {
	errorCode,
	failureReason,
	message,
	percent,
	restoreId,
	status,
	timestamp,
	rewindId,
} );

export const restoreProgress = keyedReducer(
	'siteId',
	createReducer(
		{},
		{
			[ REWIND_RESTORE ]: startProgress,
			[ REWIND_RESTORE_DISMISS_PROGRESS ]: stubNull,
			[ REWIND_RESTORE_UPDATE_PROGRESS ]: updateProgress,
			[ REWIND_RESTORE_DISMISS ]: stubNull,
		}
	)
);
restoreProgress.schema = restoreProgressSchema;

export const restoreRequest = keyedReducer(
	'siteId',
	createReducer( undefined, {
		[ REWIND_RESTORE ]: () => undefined,
		[ REWIND_RESTORE_DISMISS ]: () => undefined,
		[ REWIND_RESTORE_REQUEST ]: ( state, { activityId } ) => activityId,
	} )
);
