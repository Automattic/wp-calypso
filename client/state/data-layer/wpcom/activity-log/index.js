/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import activate from './activate';
import deactivate from './deactivate';
import deleteCredentials from './delete-credentials';
import rewind from './rewind';
import updateCredentials from './update-credentials';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers(
	'state/data-layer/wpcom/activity-log/index.js',
	mergeHandlers( activate, deactivate, deleteCredentials, rewind, updateCredentials )
);

export default {};
