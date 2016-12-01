export function getAutomatedTransferStatus( state, siteId ) {
	const status = state.automatedTransfer.status[ siteId ];
	return status || null;
}
