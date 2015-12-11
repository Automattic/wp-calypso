/**
 * Returns the site object for the currently selected site.
 *
 * @param  {Object} state  Global state tree
 * @return {Object}        Selected site
 */
export function getSelectedSite( state ) {
	if ( ! state.ui.selectedSite ) {
		return null;
	}

	return state.sites.items[ state.ui.selectedSite ];
}
