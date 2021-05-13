/**
 * Internal dependencies
 */
import 'calypso/state/ui/init';

/**
 * Returns true if site selection has occured, else false
 *
 * @param {object}  state Global state tree
 * @returns {boolean}       Has site selection occurred
 */
export default function hasInitializedSites( state ) {
	return state.ui.siteSelectionInitialized;
}
