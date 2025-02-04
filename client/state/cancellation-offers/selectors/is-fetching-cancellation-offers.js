/**
 * Is there a pending request for cancellation offers?
 * cancellationOffers is keyed on purchase ID
 * @param state
 * @param purchaseId
 * @returns null | boolean
 */
export default function isFetchingCancellationOffers( state, purchaseId ) {
	return state.cancellationOffers?.[ purchaseId ]?.isFetching ?? null;
}
