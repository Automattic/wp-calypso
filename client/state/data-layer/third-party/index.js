/**
 * Internal dependencies
 */
import directly from './directly';
import { mergeHandlers } from 'state/action-watchers/utils';

export const handlers = mergeHandlers(
	directly,
);

export default handlers;
