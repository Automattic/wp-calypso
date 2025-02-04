/**
 * Is there a pending request for applying a cancellation offer?
 * @param state
 * @param purchaseId
 * @returns null | boolean
 */
export default function isApplyingCancellationOffer( state, purchaseId ) {
	return state.cancellationOffers?.[ purchaseId ]?.isApplying ?? null;
}
