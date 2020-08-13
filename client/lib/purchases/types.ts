// TODO: complete
export interface Purchase {
	id: number;
	saleAmount?: number;
	amount: number;
	meta?: string;
	isDomainRegistration?: boolean;
	productName: string;
	currencyCode: string;
	expiryDate: string;
	renewDate: string;
	mostRecentRenewDate?: string;
	productSlug: string;
	siteId: number;
}
