/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import adTracking from './adTracking';

export const handlers = mergeHandlers(
	adTracking
);

export default handlers;
