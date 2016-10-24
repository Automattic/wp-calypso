export function getCurrentPreviewType( state ) {
	return state.ui.preview.currentPreviewType;
}
/**
 * Returns the URL if SitePreview currently has one.
 *
 * @param  {Object}  state Global state tree
 * @return {?String}  The url or null
 *
 * @see client/components/design-preview
 */
export function getPreviewUrl( state ) {
	return state.ui.preview.currentPreviewUrl;
}

export function getActiveDesignTool( state ) {
	return state.ui.preview.activeDesignTool;
}
