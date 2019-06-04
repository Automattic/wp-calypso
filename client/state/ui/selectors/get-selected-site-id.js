/**
 * Returns the currently selected site ID.
 *
 * @param  {Object}  state Global state tree
 * @return {?Number}       Selected site ID
 */
export default function getSelectedSiteId( state ) {
	return state.ui.selectedSiteId;
}
