/** @ssr-ready **/

/**
 * Returns the site object for the currently selected site.
 *
 * @param  {Object}  state  Global state tree
 * @return {?Object}        Selected site
 */
export function getSelectedSite( state ) {
	const siteId = getSelectedSiteId( state );
	if ( ! siteId ) {
		return null;
	}

	return state.sites.items[ siteId ];
}

export function getSelectedSiteId( state ) {
	return state.ui.selectedSiteId;
}

export function getCurrentEditedPostId( state ) {
	return state.ui.editor.post.currentEditedPostId;
}

export function getIsFullScreen( state ) {
	return state.ui.isFullScreen;
}
