/**
 * Get the success status of applying a cancellation offer
 * @param state
 * @param purchaseId
 * @returns boolean
 */
export default function getCancellationOfferApplySuccess( state, purchaseId ) {
	return state.cancellationOffers?.[ purchaseId ]?.applySuccess ?? false;
}
