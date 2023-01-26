import getSite from './get-site';

/**
 * Returns true if site has only a single user, false if the site not a single
 * user site, or null if the site is unknown.
 *
 * @param  {Object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?boolean}        Whether site is a single user site
 */
export default function isSingleUserSite( state, siteId ) {
	const site = getSite( state, siteId );
	return site?.single_user_site ?? null;
}
