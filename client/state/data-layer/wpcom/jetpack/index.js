/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import autoConfigCredentials from './auto-config-credentials';
import getCredentials from './get-credentials';
import updateCredentials from './update-credentials';

export default mergeHandlers(
	autoConfigCredentials,
	getCredentials,
	updateCredentials
);
