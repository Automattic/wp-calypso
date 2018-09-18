/** @format */

/**
 * Internal dependencies
 */
import applicationPasswords from './application-passwords';
import { mergeHandlers } from 'state/action-watchers/utils';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers(
	'state/data-layer/wpcom/me/two-step/index.js',
	mergeHandlers( applicationPasswords )
);

export default {};
