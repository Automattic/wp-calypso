/**
 * Internal dependencies
 */
import requestPlans from './plans-request';
import { mergeHandlers } from 'state/data-layer/utils';

export const handlers = mergeHandlers(
	requestPlans,
);

export default handlers;
