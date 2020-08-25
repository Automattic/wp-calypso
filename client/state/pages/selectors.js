/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { getComingSoonPage, getSiteFrontPage, getSitePostsPage } from 'state/sites/selectors';

export function isComingSoonPage( state, siteId, pageId ) {
	return pageId === getComingSoonPage( state, siteId );
}

export function isFrontPage( state, siteId, pageId ) {
	return pageId === getSiteFrontPage( state, siteId );
}

export function isPostsPage( state, siteId, pageId ) {
	return pageId === getSitePostsPage( state, siteId );
}
