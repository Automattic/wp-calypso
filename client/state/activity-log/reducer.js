/** @format */
/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import { activationRequesting } from './activation/reducer';
import { logItems, oldestItemTs } from './log/reducer';
import { restoreProgress, restoreRequest } from './restore/reducer';
import { backupRequest, backupProgress } from './backup/reducer';

export default combineReducers( {
	activationRequesting,
	logItems,
	oldestItemTs,
	restoreProgress,
	restoreRequest,
	backupProgress,
	backupRequest,
} );
