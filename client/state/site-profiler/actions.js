import { SITE_PROFILER_SET_REPORT, SITE_PROFILER_SET_STEP } from 'calypso/state/action-types';

import 'calypso/state/site-profiler/init';
/**
 * Sets the site profiler report
 * @param {string} url - The URL to set
 * @param {string} hash - The hash to set
 * @returns {Object} - The action object
 */
export function setSiteProfilerReport( url, hash, siteId ) {
	return {
		type: SITE_PROFILER_SET_REPORT,
		url,
		hash,
		siteId,
	};
}

export function setSiteProfilerStep( step ) {
	return {
		type: SITE_PROFILER_SET_STEP,
		step,
	};
}
