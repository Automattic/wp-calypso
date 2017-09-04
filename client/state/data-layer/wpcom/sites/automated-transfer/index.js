/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import eligibility from './eligibility';
import status from './status';

export default mergeHandlers(
	eligibility,
	status
);
