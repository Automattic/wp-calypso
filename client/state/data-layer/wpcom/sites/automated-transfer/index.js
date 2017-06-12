/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import eligibility from './eligibility';

export default mergeHandlers(
	eligibility,
);
