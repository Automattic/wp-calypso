import getRawSite from 'calypso/state/selectors/get-raw-site';

/**
 * Returns a site's URL or null if the site doesn't exist or the URL is unknown
 *
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {?string}        URL of site if known
 */
export default function getSiteUrl( state, siteId ) {
	const site = getRawSite( state, siteId );
	return site?.URL ?? null;
}
