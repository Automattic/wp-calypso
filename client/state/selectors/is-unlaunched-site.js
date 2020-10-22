/**
 * Internal dependencies
 */

import getRawSite from 'calypso/state/selectors/get-raw-site';

/**
 * Returns true if the site is unlaunched
 *
 * @param {object} state Global state tree
 * @param {object} siteId Site ID
 * @returns {boolean} True if site is unlaunched
 */
export default function isUnlaunchedSite( state, siteId ) {
	const site = getRawSite( state, siteId );

	return site && site.launch_status && site.launch_status === 'unlaunched';
}
