/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import plans from './plans';
import sites from './sites';
import read from './read';

export const handlers = mergeHandlers(
	plans,
	sites,
	read,
);

export default handlers;
