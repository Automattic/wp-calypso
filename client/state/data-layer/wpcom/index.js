/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import plans from './plans';
import sites from './sites';

export const handlers = mergeHandlers(
	plans,
	sites,
);

export default handlers;
