/** @format */
export function isSharePanelOpen( state, postGlobalId ) {
	return state.ui.postTypeList.activeSharePanels.indexOf( postGlobalId ) > -1;
}
