/**
 * Is there a pending request for cancellation offers
 * Cancellation Offers is keyed on purchase ID
 */
export default function isFetchingCancellationOffers( state, purchaseId ) {
	return state.cancellationOffers?.[ purchaseId ]?.isFetching ?? null;
}
