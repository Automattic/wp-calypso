/**
 * External dependencies
 *
 * @format
 */

/**
 * Internal dependencies
 */
import untrailingslashit from './untrailingslashit';
import trailingslashit from './trailingslashit';
import redirect from './redirect';
import normalize from './normalize';
import addQueryArgs from './add-query-args';

import path from './path';

const {
	getSiteFragment,
	addSiteFragment,
	getStatsDefaultSitePage,
	getStatsPathForTab,
	sectionify,
	sectionifyWithRoutes,
	mapPostStatus,
	externalRedirect,
} = path;

export {
	untrailingslashit,
	trailingslashit,
	redirect,
	normalize,
	addQueryArgs,
	getSiteFragment,
	addSiteFragment,
	getStatsDefaultSitePage,
	getStatsPathForTab,
	sectionify,
	sectionifyWithRoutes,
	mapPostStatus,
	externalRedirect,
};

export default {
	untrailingslashit,
	trailingslashit,
	redirect,
	normalize,
	addQueryArgs,
	getSiteFragment,
	addSiteFragment,
	getStatsDefaultSitePage,
	getStatsPathForTab,
	sectionify,
	sectionifyWithRoutes,
	mapPostStatus,
	externalRedirect,
};
