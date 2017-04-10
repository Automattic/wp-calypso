/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import accountRecovery from './account-recovery';
import me from './me';
import plans from './plans';
import read from './read';
import sites from './sites';
import timezones from './timezones';
import themeFilters from './theme-filters';
import videos from './videos';

export const handlers = mergeHandlers(
	accountRecovery,
	me,
	plans,
	read,
	sites,
	timezones,
	themeFilters,
	videos,
);

export default handlers;
