/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import adTracking from './adTracking';

export default mergeHandlers(
	adTracking
);
