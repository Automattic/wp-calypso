export function getSitePreviewDisabled( state, siteId ) {
	return state.sites.preview.items[ siteId ] && state.sites.preview.items[ siteId ].disabled;
}
