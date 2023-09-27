import { getSiteOption } from 'calypso/state/sites/selectors';

/**
 * Returns if the specified site can Blaze posts.
 * @param  {Object}  state    Global state tree
 * @param  {number}  siteId   Site ID
 * @returns {boolean}  True if the site can blaze posts, false otherwise.
 */
export default function isBlazeEnabled( state, siteId ) {
	return !! getSiteOption( state, siteId, 'can_blaze' ) || false;
}
