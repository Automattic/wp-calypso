/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import eligibility from './eligibility';
import initiate from './initiate';

export default mergeHandlers(
	eligibility,
	initiate,
);
