/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import accountRecovery from './account-recovery';
import activityLog from './activity-log';
import comments from './comments';
import domains from './domains';
import gravatarUpload from './gravatar-upload';
import me from './me';
import meta from './meta';
import plans from './plans';
import posts from './posts';
import read from './read';
import sites from './sites';
import timezones from './timezones';
import themeFilters from './theme-filters';
import users from './users';
import videos from './videos';
import login2fa from './login-2fa';

export const handlers = mergeHandlers(
	accountRecovery,
	activityLog,
	comments,
	domains,
	gravatarUpload,
	me,
	meta,
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
