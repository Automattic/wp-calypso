export function getAutomatedTransferStatus( state, siteId ) {
	const at = state.automatedTransfer[ siteId ];
	return at ? at.status : null;
}
