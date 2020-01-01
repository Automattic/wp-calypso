/**
 * Returns the currently selected site ID.
 *
 * @param  {object}  state Global state tree
 * @return {?number}       Selected site ID
 */
export default function getSelectedSiteId( state ) {
	return state.ui.selectedSiteId;
}
