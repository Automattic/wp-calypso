/**
 * Returns the site object for the currently selected site.
 *
 * @param  {Object}  state  Global state tree
 * @return {?Object}        Selected site
 */
export function getSelectedSite( state ) {
	if ( ! state.ui.selectedSiteId ) {
		return false;
	}

	return state.sites.items[ state.ui.selectedSiteId ];
}
