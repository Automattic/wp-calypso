/**
 * Internal dependencies
 */
import {
	REWIND_RESTORE,
	REWIND_RESTORE_UPDATE_PROGRESS,
	REWIND_RESTORE_UPDATE_ERROR,
} from 'state/action-types';
import {
	createReducer,
	keyedReducer,
} from 'state/utils';

const stubNull = () => null;

const startProgress = ( state, { timestamp } ) => ( {
	errorCode: '',
	failureReason: '',
	message: '',
	percent: 0,
	status: 'queued',
	timestamp,
} );

const updateProgress = ( state, {
	errorCode,
	failureReason,
	message,
	percent,
	restoreId,
	status,
	timestamp,
} ) => ( {
	errorCode,
	failureReason,
	message,
	percent,
	restoreId,
	status,
	timestamp,
} );

export const restoreError = keyedReducer( 'siteId', createReducer( {}, {
	[ REWIND_RESTORE ]: stubNull,
	[ REWIND_RESTORE_UPDATE_ERROR ]: ( state, { error } ) => error,
	[ REWIND_RESTORE_UPDATE_PROGRESS ]: stubNull,
} ) );

export const restoreProgress = keyedReducer( 'siteId', createReducer( {}, {
	[ REWIND_RESTORE ]: startProgress,
	[ REWIND_RESTORE_UPDATE_ERROR ]: stubNull,
	[ REWIND_RESTORE_UPDATE_PROGRESS ]: updateProgress,
} ) );
