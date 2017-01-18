/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import plans from './plans';
import sites from './sites';
import reader from './reader';

export const handlers = mergeHandlers(
	plans,
	sites,
	reader,
);

export default handlers;
