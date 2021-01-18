// TODO: complete this type
export interface Purchase {
	id: number;
	saleAmount?: number;
	amount: number;
	meta?: string;
	isRechargeable: boolean;
	isDomainRegistration?: boolean;
	productName: string;
	currencyCode: string;
	expiryDate: string;
	renewDate: string;
	mostRecentRenewDate?: string;
	productSlug: string;
	siteId: number;
	subscribedDate: string;
	payment: PurchasePayment;
}

export interface PurchasePayment {
	name: string;
	type: string;
	countryCode: string;
	countryName: string;
	storedDetailsId: string | number;
	expiryDate?: string; // Only for payment.type === 'paypal_direct'
	creditCard?: PurchasePaymentCreditCard; // Only for payment.type === 'credit_card'
}

export interface PurchasePaymentCreditCard {
	id: number;
	type: string;
	processor: string;
	number: string;
	expiryDate: string;
}

export interface MembershipSubscription {
	ID: string;
	currency: string;
	end_date: string | null;
	product_id: string;
	renew_interval: string | null;
	renewal_price: string;
	site_id: string;
	site_title: string;
	site_url: string;
	start_date: string;
	status: string;
	title: string;
}

export interface MembershipSubscriptionsSite {
	id: string;
	name: string;
	domain: string;
	subscriptions: MembershipSubscription[];
}
