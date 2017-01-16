/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import eligibility from './eligibility';
import status from './status';

export default mergeHandlers(
	eligibility,
	status,
);
