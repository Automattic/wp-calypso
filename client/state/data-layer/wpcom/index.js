/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import plans from './plans';
import reader from './reader';
import sites from './sites';
import read from './read';
import timezones from './timezones';

export const handlers = mergeHandlers(
	plans,
	reader,
	sites,
	read,
	timezones,
);

export default handlers;
