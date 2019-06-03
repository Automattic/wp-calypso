/**
 * Internal dependencies
 */
import getSiteFrontPage from './get-site-front-page';

/**
 * Returns true if the site is using a static front page
 *
 * @param {Object} state Global state tree
 * @param {Object} siteId Site ID
 * @return {Boolean} False if not set or set to `0`. True otherwise.
 */
export default function hasStaticFrontPage( state, siteId ) {
	return !! getSiteFrontPage( state, siteId );
}
