/** @format */
export function isSharePanelOpen( state, postGlobalId ) {
	return state.ui.postTypeList.activeSharePanels.indexOf( postGlobalId ) > -1;
}

export function isPostSelected( state, postGlobalId ) {
	return state.ui.postTypeList.selectedPosts.indexOf( postGlobalId ) > -1;
}

export function getSelectedPostsCount( state ) {
	return state.ui.postTypeList.selectedPosts.length;
}

export function isMultiSelectEnabled( state ) {
	return state.ui.postTypeList.isMultiSelectEnabled;
}
