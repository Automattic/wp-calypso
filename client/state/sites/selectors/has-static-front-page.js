import getSiteFrontPage from './get-site-front-page';
import getSiteFrontPageType from './get-site-front-page-type';

/**
 * Returns true if the site is using a static front page
 *
 * @param {Object} state Global state tree
 * @param {Object} siteId Site ID
 * @returns {boolean} False if not set or set to `0`. True otherwise.
 */
export default function hasStaticFrontPage( state, siteId ) {
	return 'page' === getSiteFrontPageType( state, siteId ) && !! getSiteFrontPage( state, siteId );
}
