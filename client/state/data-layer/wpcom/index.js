/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import accountRecovery from './account-recovery';
import plans from './plans';
import posts from './posts';
import read from './read';
import sites from './sites';
import timezones from './timezones';
import videos from './videos';

export const handlers = mergeHandlers(
	accountRecovery,
	plans,
	posts,
	read,
	sites,
	timezones,
	videos,
);

export default handlers;
