/**
 * Get Cancellation offers for the given purchase ID
 * @param state
 * @param purchaseId
 * @returns array
 */
export default function getCancellationOffers( state, purchaseId ) {
	return state.cancellationOffers?.[ purchaseId ]?.offers ?? [];
}
