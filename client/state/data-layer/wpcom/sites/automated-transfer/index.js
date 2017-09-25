/**
 * Internal dependencies
 */
import eligibility from './eligibility';
import initiate from './initiate';
import status from './status';
import { mergeHandlers } from 'state/action-watchers/utils';

export default mergeHandlers(
	eligibility,
	initiate,
	status
);
