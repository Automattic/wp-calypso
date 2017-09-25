/**
 * Internal dependencies
 */
import accountRecovery from './account-recovery';
import activityLog from './activity-log';
import comments from './comments';
import gravatarUpload from './gravatar-upload';
import login2fa from './login-2fa';
import me from './me';
import plans from './plans';
import posts from './posts';
import read from './read';
import sites from './sites';
import themeFilters from './theme-filters';
import timezones from './timezones';
import users from './users';
import videos from './videos';
import { mergeHandlers } from 'state/action-watchers/utils';

export const handlers = mergeHandlers(
	accountRecovery,
	activityLog,
	comments,
	gravatarUpload,
	me,
	plans,
	posts,
	read,
	sites,
	timezones,
	themeFilters,
	users,
	videos,
	login2fa
);

export default handlers;
