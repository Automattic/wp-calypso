/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import accountRecovery from './account-recovery';
import plans from './plans';
import sites from './sites';
import read from './read';
import timezones from './timezones';

export const handlers = mergeHandlers(
	accountRecovery,
	plans,
	sites,
	read,
	timezones,
);

export default handlers;
