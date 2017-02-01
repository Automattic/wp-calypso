/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import plans from './plans';
import read from './read';
import sites from './sites';
import timezones from './timezones';

export const handlers = mergeHandlers(
	plans,
	read,
	sites,
	timezones,
);

export default handlers;
