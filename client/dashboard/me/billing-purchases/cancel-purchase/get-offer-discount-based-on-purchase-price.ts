import type { CancellationOffer, Purchase } from '@automattic/api-core';

export function getOfferDiscountBasedOnPurchasePrice(
	purchase: Purchase,
	cancellationOffer: CancellationOffer | undefined
): number {
	if ( ! cancellationOffer ) {
		return 0;
	}
	const offerDiscountPercentage = ( 1 - cancellationOffer.raw_price / purchase.amount ) * 100;
	// Round the cancellation offer discount percentage to the nearest whole number
	return Math.round( offerDiscountPercentage );
}
