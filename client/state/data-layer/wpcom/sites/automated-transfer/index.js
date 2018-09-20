/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import eligibility from './eligibility';
import initiate from './initiate';
import status from './status';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers(
	'state/data-layer/wpcom/sites/automated-transfer/index.js',
	mergeHandlers( eligibility, initiate, status )
);

export default {};
