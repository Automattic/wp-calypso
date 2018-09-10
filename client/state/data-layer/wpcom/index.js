/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import accountRecovery from './account-recovery';
import activePromotions from './active-promotions';
import activityLog from './activity-log';
import checklist from './checklist';
import comments from './comments';
import concierge from './concierge';
import domains from './domains';
import gravatarUpload from './gravatar-upload';
import helpSearch from './help/search';
import i18n from './i18n';
import jetpackConnectionOwner from './jetpack/connection/owner';
import jetpackInstall from './jetpack-install';
import jetpackSettings from './jetpack/settings';
import localeGuess from './locale-guess';
import login2fa from './login-2fa';
import logstash from './logstash';
import me from './me';
import meta from './meta';
import posts from './posts';
import read from './read';
import sites from './sites';
import themeFilters from './theme-filters';
import timezones from './timezones';
import usersAuthOptions from './users/auth-options';
import videos from './videos';
import wordads from './wordads';

export const handlers = mergeHandlers(
	accountRecovery,
	activePromotions,
	activityLog,
	checklist,
	comments,
	concierge,
	domains,
	gravatarUpload,
	helpSearch,
	i18n,
	jetpackConnectionOwner,
	jetpackInstall,
	jetpackSettings,
	localeGuess,
	login2fa,
	logstash,
	me,
	meta,
	posts,
	read,
	sites,
	themeFilters,
	timezones,
	usersAuthOptions,
	videos,
	wordads
);

export default handlers;
