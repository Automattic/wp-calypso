/**
 * Is there a pending request for applying a cancellation offer?
 */
export default function isApplyingCancellationOffer( state, purchaseId ) {
	return state.cancellationOffers?.[ purchaseId ]?.isApplying ?? null;
}
