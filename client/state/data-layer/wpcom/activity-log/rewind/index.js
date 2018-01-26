/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import activate from './activate';
import restoreHandler from './to';
import restoreStatusHandler from './restore-status';
import backupHandler from './downloads';

export default mergeHandlers( activate, restoreHandler, restoreStatusHandler, backupHandler );
