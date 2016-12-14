/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import eligibility from './eligibility';

export default mergeHandlers(
	eligibility,
);
