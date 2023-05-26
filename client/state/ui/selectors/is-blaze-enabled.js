import { getSiteOption } from 'calypso/state/sites/selectors';

/**
 * Returns if the currently selected site can Blaze posts.
 *
 * @param  {Object}  state Global state tree
 * @returns {?number}       Selected site ID
 */
export default function isBlazeEnabled( state, siteId ) {
	return !! getSiteOption( state, siteId, 'can_blaze' ) || false;
}
