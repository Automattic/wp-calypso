/**
 * Get Cancellation offers for the given purchase ID
 *
 * @param state
 * @param purchaseId
 * @returns {any}
 */
export default function getCancellationOffers( state, purchaseId ) {
	return state.cancellationOffers?.[ purchaseId ]?.offers ?? [];
}
