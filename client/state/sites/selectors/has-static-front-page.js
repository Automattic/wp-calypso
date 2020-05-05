/**
 * Internal dependencies
 */
import getSiteFrontPage from './get-site-front-page';
import getSiteFrontPageType from './get-site-front-page-type';

/**
 * Returns true if the site is using a static front page
 *
 * @param {object} state Global state tree
 * @param {object} siteId Site ID
 * @returns {boolean} False if not set or set to `0`. True otherwise.
 */
export default function hasStaticFrontPage( state, siteId ) {
	return 'page' === getSiteFrontPageType( state, siteId ) && !! getSiteFrontPage( state, siteId );
}
