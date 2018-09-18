/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import activate from './activate';
import restoreHandler from './to';
import restoreStatusHandler from './restore-status';
import backupHandler from './downloads';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers(
	'state/data-layer/wpcom/activity-log/rewind/index.js',
	mergeHandlers( activate, restoreHandler, restoreStatusHandler, backupHandler )
);

export default {};
