/**
 * Internal dependencies
 */
import 'calypso/state/media/init';

/**
 * Retrieves the current query for media items for a given site.
 *
 * @param {object} state The redux state.
 * @param {number} siteId The site to get the current media query for.
 */
export default function getCurrentMediaQuery( state, siteId ) {
	return state.media.fetching[ siteId ]?.query ?? null;
}
