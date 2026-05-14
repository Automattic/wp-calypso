export interface IntroOffer {
	currencyCode: string;
	discountPercentage: number;
	formattedPrice: string;
	ineligibleReason: string[] | null;
	isContentFlagged?: boolean;
	productId: number;
	productSlug: string;
	rawPrice: number;
}

export interface ResponseIntroOffer {
	currency_code: string;
	discount_percentage: number;
	formatted_price: string;
	ineligible_reason: string[] | null;
	is_content_flagged?: boolean;
	product_id: number;
	product_slug: string;
	raw_price: number;
}

export enum RequestStatus {
	Pending = 'pending',
	Success = 'success',
	Failed = 'failed',
}
