import getRawSite from './get-raw-site';

/**
 * Returns true if site is a WP for Teams site, false if not and null if unknown
 * @param  {Object|unknown}   state  Global state tree
 * @param  {number|null}   siteId Site ID
 * @returns {?boolean}        Whether site is a WP for Teams site
 */
export default function isSiteWPForTeams( state, siteId ) {
	const site = getRawSite( state, siteId );
	return site?.options?.is_wpforteams_site ?? null;
}
