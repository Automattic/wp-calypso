export function createDomainObject( status ) {
	return {
		locked: status.locked,
		pendingTransfer: status.pending_transfer,
		transferProhibited: status.transfer_prohibited,
	};
}
