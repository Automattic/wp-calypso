export interface IntroOffer {
	productId: number;
	productSlug: string;
	currencyCode: string;
	formattedPrice: string;
	rawPrice: number;
}

export interface ResponseIntroOffer {
	product_id: number;
	product_slug: string;
	currency_code: string;
	formatted_price: string;
	raw_price: number;
}

export enum RequestStatus {
	Pending = 'pending',
	Success = 'success',
	Failed = 'failed',
}
