/**
 * External dependencies
 */


/**
 * Internal dependencies
 */
import { getSiteFrontPage } from 'state/sites/selectors';

export function isFrontPage( state, siteId, pageId ) {
	return pageId === getSiteFrontPage( state, siteId );
}
