/**
 * Returns the site object for the currently selected site.
 *
 * @param  {Object} state  Global state tree
 * @return {Object}        Selected site
 */
export function getSelectedSite( state ) {
	const { selected, byId } = state.sites;

	if ( ! selected ) {
		return null;
	}

	return byId[ selected ];
}
