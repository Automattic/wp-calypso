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
} from 'calypso/state/action-types';
import { keyedReducer, withSchemaValidation, withoutPersistence } from 'calypso/state/utils';

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

export const restoreProgress = withSchemaValidation(
	restoreProgressSchema,
	keyedReducer(
		'siteId',
		withoutPersistence( ( state = {}, action ) => {
			switch ( action.type ) {
				case REWIND_RESTORE:
					return startProgress( state, action );
				case REWIND_RESTORE_DISMISS_PROGRESS:
					return stubNull( state, action );
				case REWIND_RESTORE_UPDATE_PROGRESS:
					return updateProgress( state, action );
				case REWIND_RESTORE_DISMISS:
					return stubNull( state, action );
			}

			return state;
		} )
	)
);

export const restoreRequest = keyedReducer(
	'siteId',
	withoutPersistence( ( state = undefined, action ) => {
		switch ( action.type ) {
			case REWIND_RESTORE:
				return undefined;
			case REWIND_RESTORE_DISMISS:
				return undefined;
			case REWIND_RESTORE_REQUEST: {
				const { activityId } = action;
				return activityId;
			}
		}

		return state;
	} )
);
