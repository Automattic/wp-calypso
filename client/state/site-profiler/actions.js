import { SITE_PROFILER_SET_REPORT } from 'calypso/state/action-types';

import 'calypso/state/site-profiler/init';
/**
 * Sets the site profiler report
 * @param {string} url - The URL to set
 * @param {string} hash - The hash to set
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
