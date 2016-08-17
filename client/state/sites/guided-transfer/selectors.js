export function isRequestingGuidedTransferStatus( state, siteId ) {
	return state.sites.guidedTransfer.isFetching[ siteId ] === true;
}

export function isGuidedTransferInProgress( state, siteId ) {
	const status = state.sites.guidedTransfer.status[ siteId ];
	if ( ! status ) {
		return false;
	}

	return status.upgrade_purchased &&
		status.host_details_entered;
}

/**
 * Returns true if the user has initiated a guided transfer, but
 * we're still waiting for them to purchase the GT
 *
 * @param {Object} state The Redux state object
 * @param {number} siteId The siteId to check
 * @return {bool} true if guided transfer is awaiting purchase
 */
export function isGuidedTransferAwaitingPurchase( state, siteId ) {
	const status = state.sites.guidedTransfer.status[ siteId ];
	if ( ! status ) {
		return false;
	}

	return ( ! status.upgrade_purchased ) &&
		status.host_details_entered;
}
