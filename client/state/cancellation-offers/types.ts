export interface CancellationOffer {
	currencyCode: string;
	discountPercentage: number;
	discountedPeriods: number;
	formattedPrice: string;
	offerCode: string;
}

export interface CancellationOfferAPIResponse {
	currency_code: string;
	discount_percentage: number;
	discounted_periods: 1;
	formatted_price: string;
	offer_code: string;
}
