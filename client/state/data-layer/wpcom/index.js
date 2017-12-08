/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import accountRecovery from './account-recovery';
import activityLog from './activity-log';
import checklist from './checklist';
import comments from './comments';
import concierge from './concierge';
import domains from './domains';
import gravatarUpload from './gravatar-upload';
import login2fa from './login-2fa';
import me from './me';
import meta from './meta';
import plans from './plans';
import posts from './posts';
import privacyPolicy from './privacy-policy';
import read from './read';
import sites from './sites';
import themeFilters from './theme-filters';
import users from './users';
import usersAuthOptions from './users/auth-options';
import videos from './videos';

export const handlers = mergeHandlers(
	accountRecovery,
	activityLog,
	checklist,
	comments,
	concierge,
	domains,
	gravatarUpload,
	login2fa,
	me,
	meta,
	plans,
	posts,
	privacyPolicy,
	read,
	sites,
	themeFilters,
	users,
	usersAuthOptions,
	videos
);

export default handlers;
