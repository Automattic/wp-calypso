/**
 * Get the error status of applying a cancellation offer
 *
 * @param state
 * @param purchaseId
 * @returns {any}
 */
export default function getCancellationOfferApplyError( state, purchaseId ) {
	return state.cancellationOffers?.[ purchaseId ]?.applyError ?? null;
}
