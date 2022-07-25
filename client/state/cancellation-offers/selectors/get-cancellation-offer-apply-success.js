/**
 * Get the success status of applying a cancellation offer
 *
 * @param state
 * @param purchaseId
 * @returns {any}
 */
export default function getCancellationOfferApplySuccess( state, purchaseId ) {
	return state.cancellationOffers?.[ purchaseId ]?.applySuccess ?? false;
}
