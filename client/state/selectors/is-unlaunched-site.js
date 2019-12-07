/** @format */

/**
 * Internal dependencies
 */

import getRawSite from 'state/selectors/get-raw-site';

/**
 * Returns true if the site is unlaunched
 *
 * @param {Object} state Global state tree
 * @param {Object} siteId Site ID
 * @return {Boolean} True if site is unlaunched
 */
export default function isUnlaunchedSite( state, siteId ) {
	const site = getRawSite( state, siteId );

	return site && site.launch_status && site.launch_status === 'unlaunched';
}
