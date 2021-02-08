/**
 * Internal dependencies
 */
import 'calypso/state/whats-new/init';

/**
 * Returns the Home layout for a given site.
 *
 * @param  {object}  state   Global state tree
 * @returns {object} Object with list of cards for each region
 */
export function getWhatsNewList( state ) {
	return state.whatsNew.list;
}
