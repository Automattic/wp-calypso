import {
	SITE_PROFILER_SET_LAST_VISITED_REPORT,
	SITE_PROFILER_SET_REPORT,
} from 'calypso/state/action-types';

import 'calypso/state/site-profiler/init';
/**
 * Sets the site profiler report
 * @param {string} url - The URL to set
 * @param {string} hash - The hash to set
 * @param {number | undefined} siteId - The ID of the site
 * @param {string} pageId - The ID of the page, 0 means Home page.
 * @returns {Object} - The action object
 */
export function setSiteProfilerReport( url, hash, siteId, pageId ) {
	return {
		type: SITE_PROFILER_SET_REPORT,
		url,
		hash,
		siteId,
		pageId,
	};
}

/**
 * Sets the last visited site profiler report
 * @param {number | undefined} siteId - The ID of the site
 * @param {string} pageId - The ID of the page
 * @returns {Object} - The action object
 */
export function setSiteProfilerLastVisitedReport( siteId, pageId ) {
	return {
		type: SITE_PROFILER_SET_LAST_VISITED_REPORT,
		siteId,
		pageId,
	};
}
