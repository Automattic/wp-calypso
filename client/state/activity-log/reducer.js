/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import { activationRequesting } from './activation/reducer';
import { logItems, logErrors } from './log/reducer';
import { restoreProgress, restoreErrors } from './restore/reducer';
import { rewindStatus, rewindStatusErrors } from './rewind-status/reducer';

export default combineReducers( {
	activationRequesting,
	logErrors,
	logItems,
	restoreErrors,
	restoreProgress,
	rewindStatus,
	rewindStatusErrors,
} );
