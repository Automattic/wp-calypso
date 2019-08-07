/**
 * Internal dependencies
 */
import getSiteSetting from 'state/selectors/get-site-setting';

/**
 * Returns the front page type.
 *
 * @param {Object} state Global state tree
 * @param {Object} siteId Site ID
 * @return {String} 'posts' if blog posts are set as the front page or 'page' if a static page is
 */
export default function getSiteFrontPageType( state, siteId ) {
	return getSiteSetting( state, siteId, 'show_on_front' );
}
