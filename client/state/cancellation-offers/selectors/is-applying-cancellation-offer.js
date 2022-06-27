/**
 * Is there a pending request for applying a cancellation offer?
 */
export default function isFetchingCancellationOffers( state, purchaseId ) {
	return state.cancellationOffers?.[ purchaseId ]?.isApplying ?? null;
}
