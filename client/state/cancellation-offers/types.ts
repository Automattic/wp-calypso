export interface CancellationOffer {
	currencyCode: string;
	discountPercentage: number;
	discountedPeriods: number;
	formattedPrice: string;
	originalPrice: number;
	rawPrice: number;
}

export interface CancellationOfferAPIResponse {
	currency_code: string;
	discount_percentage: number;
	discounted_periods: 1;
	formatted_price: string;
	original_price: number;
	raw_price: number;
}
