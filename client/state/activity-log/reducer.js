/**
 * Internal dependencies
 */
import { activationRequesting } from './activation/reducer';
import { logItems, logError } from './log/reducer';
import { restoreProgress } from './restore/reducer';
import { rewindStatus, rewindStatusError } from './rewind-status/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	activationRequesting,
	logError,
	logItems,
	restoreProgress,
	rewindStatus,
	rewindStatusError,
} );
