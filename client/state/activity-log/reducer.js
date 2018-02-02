/** @format */
/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import { activationRequesting } from './activation/reducer';
import { logItems } from './log/reducer';
import { restoreProgress, restoreRequest } from './restore/reducer';
import { backupRequest, backupProgress } from './backup/reducer';

export default combineReducers( {
	activationRequesting,
	logItems,
	restoreProgress,
	restoreRequest,
	backupProgress,
	backupRequest,
} );
