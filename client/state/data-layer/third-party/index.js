/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import directly from './directly';

export const handlers = mergeHandlers(
	directly,
);

export default handlers;
