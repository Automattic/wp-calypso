export function isRequestingGuidedTransferStatus( state, siteId ) {
	return state.sites.guidedTransfer.isFetching[ siteId ] === true;
}
