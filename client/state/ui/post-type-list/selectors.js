export function isSharePanelOpen( state, postGlobalId ) {
	return state.ui.postTypeList.activeSharePanels.indexOf( postGlobalId ) > -1;
}

export function getOpenSharePanels( state ) {
	return state.ui.postTypeList.activeSharePanels;
}
