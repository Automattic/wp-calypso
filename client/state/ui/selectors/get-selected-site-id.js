/**
 * Internal dependencies
 */
import 'calypso/state/ui/init';

/**
 * Returns the currently selected site ID.
 *
 * @param  {object}  state Global state tree
 * @returns {?number}       Selected site ID
 */
export default function getSelectedSiteId( state ) {
	return state.ui.selectedSiteId;
}
