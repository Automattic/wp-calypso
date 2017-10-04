/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import { activationRequesting } from './activation/reducer';
import { logItems } from './log/reducer';
import { restoreProgress } from './restore/reducer';
import { rewindStatus, rewindStatusError } from './rewind-status/reducer';
import { rewindSetCredentials, rewindSetCredentialsError } from './set-credentials/reducer';

export default combineReducers( {
	activationRequesting,
	logItems,
	restoreProgress,
	rewindSetCredentials,
	rewindSetCredentialsError,
	rewindStatus,
	rewindStatusError,
} );
