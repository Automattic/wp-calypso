/**
 * Internal dependencies
 */
import { getSiteOption } from 'calypso/state/sites/selectors';

/**
 * Returns the ID of the static page set as the page for posts, or 0 if a static page is not set.
 *
 * @param {object} state Global state tree
 * @param {object} siteId Site ID
 * @returns {number} ID of the static page set as page for posts, or 0 if a static page is not set
 */
export default function getSitePostsPage( state, siteId ) {
	return getSiteOption( state, siteId, 'page_for_posts' );
}
