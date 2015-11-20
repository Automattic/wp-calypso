function createDomainObject( status ) {
	return {
		locked: status.locked,
		pendingTransfer: status.pending_transfer
	};
}

export default { createDomainObject };
