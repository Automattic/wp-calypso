/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import { activationRequesting } from './activation/reducer';
import { logItems, logError } from './log/reducer';
import { restoreProgress, restoreError } from './restore/reducer';
import { rewindStatus, rewindStatusError } from './rewind-status/reducer';

export default combineReducers( {
	activationRequesting,
	logError,
	logItems,
	restoreError,
	restoreProgress,
	rewindStatus,
	rewindStatusError,
} );
